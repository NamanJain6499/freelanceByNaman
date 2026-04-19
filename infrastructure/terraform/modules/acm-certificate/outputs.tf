output "certificate_arn" {
  description = "ARN of ACM certificate"
  value       = aws_acm_certificate.this.arn
}

output "domain_validation_options" {
  description = "Domain validation options for Route53 records"
  value       = aws_acm_certificate.this.domain_validation_options
}

output "certificate_id" {
  description = "Certificate ID"
  value       = aws_acm_certificate.this.id
}
