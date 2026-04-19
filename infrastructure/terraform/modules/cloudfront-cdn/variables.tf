variable "name" {
  description = "Name prefix for resources"
  type        = string
}

variable "domain_name" {
  description = "Primary domain name"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "prod"
}

variable "aliases" {
  description = "List of alternate domain names (CNAMEs)"
  type        = list(string)
}

variable "origin_domain_name" {
  description = "Origin S3 bucket domain name"
  type        = string
}

variable "acm_certificate_arn" {
  description = "ARN of ACM certificate"
  type        = string
}

variable "price_class" {
  description = "CloudFront price class"
  type        = string
  default     = "PriceClass_100"
}

variable "waf_web_acl_arn" {
  description = "ARN of WAF Web ACL (optional)"
  type        = string
  default     = null
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}
