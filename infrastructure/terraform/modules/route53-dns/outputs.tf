output "zone_id" {
  description = "Route53 hosted zone ID"
  value       = var.route53_zone_id
}

output "name_servers" {
  description = "Route53 name servers"
  value       = []
}
