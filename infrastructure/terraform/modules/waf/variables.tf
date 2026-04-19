variable "enable" {
  description = "Enable WAF"
  type        = bool
  default     = false
}

variable "name" {
  description = "Name prefix for resources"
  type        = string
}

variable "domain_name" {
  description = "Domain name (for description)"
  type        = string
}

variable "rate_limit" {
  description = "Rate limit (requests per 5 minutes per IP)"
  type        = number
  default     = 2000
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}
