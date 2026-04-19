variable "domain_name" {
  description = "Primary domain name for the site (e.g., namanjain.dev)"
  type        = string
}

variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
  default     = "portfolio"
}

variable "environment" {
  description = "Environment name (prod, staging, etc.)"
  type        = string
  default     = "prod"
}

variable "s3_bucket_name" {
  description = "S3 bucket name (optional, auto-generated if empty)"
  type        = string
  default     = ""
}

variable "cloudfront_price_class" {
  description = "CloudFront price class (PriceClass_100, PriceClass_200, PriceClass_All)"
  type        = string
  default     = "PriceClass_100"
}

variable "enable_waf" {
  description = "Enable AWS WAF on CloudFront"
  type        = bool
  default     = false
}

variable "enable_contact_form_email" {
  description = "Enable SES email sending from Lambda"
  type        = bool
  default     = false
}

variable "contact_form_to_email" {
  description = "Email address to receive contact form submissions"
  type        = string
  default     = ""
}

variable "contact_form_from_email" {
  description = "Email address to send contact form emails from"
  type        = string
  default     = ""
}
