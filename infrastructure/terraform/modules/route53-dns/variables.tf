variable "domain_name" {
  description = "Primary domain name"
  type        = string
}

variable "domain_validation_options" {
  description = "ACM certificate domain validation options"
  type        = list(any)
}

variable "cloudfront_domain_name" {
  description = "CloudFront distribution domain name"
  type        = string
}

variable "cloudfront_hosted_zone_id" {
  description = "CloudFront distribution hosted zone ID"
  type        = string
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}

variable "route53_zone_id" {
  description = "Route53 zone ID for DNS records"
  type        = string
}
