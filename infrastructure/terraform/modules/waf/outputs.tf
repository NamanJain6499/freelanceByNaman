output "web_acl_arn" {
  description = "WAF Web ACL ARN"
  value       = var.enable ? aws_wafv2_web_acl.this[0].arn : null
}

output "web_acl_id" {
  description = "WAF Web ACL ID"
  value       = var.enable ? aws_wafv2_web_acl.this[0].id : null
}
