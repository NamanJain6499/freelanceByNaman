terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  required_version = ">= 1.5.0"

  # Backend configured via CLI in CI/CD
  # Local backend used for initial bootstrap
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
  name_prefix = "${var.project_name}-${var.environment}"
  bucket_name = var.s3_bucket_name != "" ? var.s3_bucket_name : "${var.domain_name}-assets-${data.aws_caller_identity.current.account_id}"
}

# ACM Certificate (must be in us-east-1 for CloudFront)
module "acm" {
  source = "./modules/acm-certificate"
  providers = {
    aws = aws.us_east_1
  }

  domain_name               = var.domain_name
  subject_alternative_names = ["www.${var.domain_name}"]
  tags                      = local.common_tags
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

# CloudFront Distribution
module "cdn" {
  source = "./modules/cloudfront-cdn"

  name                = local.name_prefix
  domain_name         = var.domain_name
  environment         = var.environment
  aliases             = [var.domain_name, "www.${var.domain_name}"]
  origin_domain_name  = module.s3.bucket_regional_domain_name
  acm_certificate_arn = aws_acm_certificate_validation.this.certificate_arn
  price_class         = var.cloudfront_price_class
  waf_web_acl_arn     = var.enable_waf ? module.waf.web_acl_arn : null
  tags                = local.common_tags
}

# S3 Bucket for static assets
module "s3" {
  source = "./modules/s3-static-website"

  bucket_name                 = local.bucket_name
  cloudfront_distribution_arn = module.cdn.distribution_arn
  tags                        = local.common_tags
}

# Route53 DNS Records
module "dns" {
  source = "./modules/route53-dns"

  domain_name               = var.domain_name
  domain_validation_options = module.acm.domain_validation_options
  cloudfront_domain_name    = module.cdn.distribution_domain_name
  cloudfront_hosted_zone_id = module.cdn.distribution_hosted_zone_id
  tags                      = local.common_tags
}

# Contact Form API (Lambda + API Gateway)
module "contact_api" {
  source = "./modules/contact-form-api"

  name            = local.name_prefix
  environment     = var.environment
  lambda_zip_path = "${path.module}/lambda/contact-form.zip"
  to_email        = var.contact_form_to_email
  from_email      = var.contact_form_from_email
  enable_ses      = var.enable_contact_form_email
  tags            = local.common_tags
}

# ACM Certificate Validation (must wait for DNS records)
resource "aws_acm_certificate_validation" "this" {
  provider = aws.us_east_1

  certificate_arn         = module.acm.certificate_arn
  validation_record_fqdns = [for record in module.acm.domain_validation_options : record.resource_record_name]

  depends_on = [module.dns]
}
