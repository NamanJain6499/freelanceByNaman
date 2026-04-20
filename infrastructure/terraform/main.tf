terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  required_version = ">= 1.5.0"
}

# Primary region for most resources
provider "aws" {
  region = var.aws_region
}

# ACM certificates for CloudFront must be in us-east-1
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}

# Data sources
data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

# Locals
locals {
  common_tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }
  name_prefix   = "${var.project_name}-${var.environment}"
  has_domain    = var.domain_name != ""
  bucket_suffix = local.has_domain ? "${var.domain_name}-assets" : "${var.project_name}-${var.environment}-assets"
  bucket_name   = var.s3_bucket_name != "" ? var.s3_bucket_name : "${local.bucket_suffix}-${data.aws_caller_identity.current.account_id}"
}

# Route53 Hosted Zone (only if domain is provided)
resource "aws_route53_zone" "this" {
  count = local.has_domain ? 1 : 0
  name  = var.domain_name
  tags  = local.common_tags
}

# ACM Certificate (only if domain is provided, must be in us-east-1 for CloudFront)
module "acm" {
  count  = local.has_domain ? 1 : 0
  source = "./modules/acm-certificate"
  providers = {
    aws = aws.us_east_1
  }

  domain_name               = var.domain_name
  subject_alternative_names = ["www.${var.domain_name}"]
  tags                      = local.common_tags
}

# Certificate validation records in Route53 (only if domain is provided)
resource "aws_route53_record" "cert_validation" {
  for_each = local.has_domain ? {
    for dvo in module.acm[0].domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  } : {}

  zone_id = aws_route53_zone.this[0].zone_id
  name    = each.value.name
  type    = each.value.type
  records = [each.value.record]
  ttl     = 60
}

# ACM Certificate Validation (waits for DNS, only if domain is provided)
resource "aws_acm_certificate_validation" "this" {
  count    = local.has_domain ? 1 : 0
  provider = aws.us_east_1

  certificate_arn         = module.acm[0].certificate_arn
  validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]
}

# WAF (optional)
module "waf" {
  source = "./modules/waf"
  providers = {
    aws = aws.us_east_1
  }

  enable      = var.enable_waf
  name        = local.name_prefix
  domain_name = var.domain_name
  rate_limit  = 2000
  tags        = local.common_tags
}

# S3 Bucket for static assets
module "s3" {
  source = "./modules/s3-static-website"

  bucket_name                 = local.bucket_name
  cloudfront_distribution_arn = module.cdn.distribution_arn
  tags                        = local.common_tags
}

# CloudFront Distribution
module "cdn" {
  source = "./modules/cloudfront-cdn"

  name                = local.name_prefix
  domain_name         = var.domain_name
  environment         = var.environment
  aliases             = local.has_domain ? [var.domain_name, "www.${var.domain_name}"] : []
  origin_domain_name  = module.s3.bucket_regional_domain_name
  acm_certificate_arn = local.has_domain ? aws_acm_certificate_validation.this[0].certificate_arn : null
  price_class         = var.cloudfront_price_class
  waf_web_acl_arn     = var.enable_waf ? module.waf.web_acl_arn : null
  tags                = local.common_tags

  # Note: Implicit dependency via acm_certificate_arn when has_domain is true
}

# Route53 DNS Records for the site (only if domain is provided)
module "dns" {
  count  = local.has_domain ? 1 : 0
  source = "./modules/route53-dns"

  domain_name               = var.domain_name
  domain_validation_options = [] # Already handled above
  cloudfront_domain_name    = module.cdn.distribution_domain_name
  cloudfront_hosted_zone_id = module.cdn.distribution_hosted_zone_id
  route53_zone_id           = aws_route53_zone.this[0].zone_id
  tags                      = local.common_tags

  depends_on = [module.cdn]
}

# Contact Form API (Lambda + API Gateway) - only if contact form is enabled
module "contact_api" {
  count  = var.enable_contact_form_email ? 1 : 0
  source = "./modules/contact-form-api"

  name            = local.name_prefix
  environment     = var.environment
  lambda_zip_path = "${path.module}/lambda/contact-form.zip"
  to_email        = var.contact_form_to_email
  from_email      = var.contact_form_from_email
  enable_ses      = var.enable_contact_form_email
  tags            = local.common_tags
}
