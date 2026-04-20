output "zone_id" {
  description = "Route53 hosted zone ID"
  value       = data.aws_route53_zone.this.zone_id
}

output "name_servers" {
  description = "Route53 name servers"
  value       = data.aws_route53_zone.this.name_servers
}
