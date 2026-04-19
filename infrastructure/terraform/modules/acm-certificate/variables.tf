variable "domain_name" {
  description = "Primary domain name for certificate"
  type        = string
}

variable "subject_alternative_names" {
  description = "List of SANs for certificate"
  type        = list(string)
  default     = []
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}
