output "s3_bucket_name" {
  description = "S3 bucket name for static site assets"
  value       = module.s3.bucket_name
}

output "s3_bucket_arn" {
  description = "S3 bucket ARN"
  value       = module.s3.bucket_arn
}

output "cloudfront_distribution_id" {
  description = "CloudFront Distribution ID for cache invalidation"
  value       = module.cdn.distribution_id
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name"
  value       = module.cdn.distribution_domain_name
}

output "site_url" {
  description = "Main site URL"
  value       = "https://${var.domain_name}"
}

output "contact_form_api_endpoint" {
  description = "API Gateway endpoint for contact form"
  value       = module.contact_api.api_endpoint
}

output "certificate_arn" {
  description = "ACM certificate ARN"
  value       = module.acm.certificate_arn
}

output "route53_zone_id" {
  description = "Route53 hosted zone ID"
  value       = module.dns.zone_id
}

output "name_servers" {
  description = "Route53 name servers (update your domain registrar)"
  value       = module.dns.name_servers
}

output "contact_form_lambda_name" {
  description = "Lambda function name for contact form"
  value       = module.contact_api.lambda_function_name
}

output "terraform_state_backend_config" {
  description = "Backend configuration for remote state (run after first apply)"
  value       = <<-EOT

# Add this to your terraform backend config after the first apply:
backend "s3" {
  bucket         = "${local.bucket_name}-tfstate"
  key            = "${var.project_name}/${var.environment}/terraform.tfstate"
  region         = "${var.aws_region}"
  encrypt        = true
  dynamodb_table = "${local.name_prefix}-terraform-locks"
}
EOT
}
