# Modularized Terraform Infrastructure

This directory contains a modular Terraform setup for deploying your portfolio to AWS.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        ROOT MODULE                              │
│                         main.tf                                 │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │    S3    │  │CloudFront│  │ Route53  │  │  WAF     │        │
│  │  Module  │  │  Module  │  │  Module  │  │ (opt)    │        │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘        │
│       │             │             │             │              │
│       └─────────────┴─────────────┴─────────────┘              │
│                     │                                           │
│  ┌──────────────────┼──────────────────┐                        │
│  │                  │                  │                        │
│  │           ┌──────┴──────┐          │                        │
│  │           │   ACM Cert  │          │                        │
│  │           │   Module    │          │                        │
│  │           └─────────────┘          │                        │
│  │                                    │                        │
│  │    ┌──────────────────┐            │                        │
│  │    │  Contact Form    │            │                        │
│  │    │  API Module      │            │                        │
│  │    │  (Lambda + GW)   │            │                        │
│  │    └──────────────────┘            │                        │
│  │                                    │                        │
└──┴────────────────────────────────────┴────────────────────────┘
```

## Modules

### `s3-static-website/`
Creates a private S3 bucket with:
- Origin Access Control policy for CloudFront
- Versioning enabled
- Server-side encryption
- Lifecycle rules

### `cloudfront-cdn/`
Creates a CloudFront distribution with:
- Origin Access Control to S3
- SPA routing (CloudFront function)
- Custom error responses for 403/404 -> index.html
- HTTPS redirect
- Optional WAF integration

### `acm-certificate/`
Creates an ACM certificate in us-east-1 for CloudFront with:
- Primary domain
- www subdomain SAN

### `route53-dns/`
Creates Route53 resources:
- Hosted zone
- Certificate validation records
- A/AAAA alias records for apex
- CNAME for www

### `contact-form-api/`
Creates contact form backend:
- Lambda function (Python)
- API Gateway REST API
- CORS configuration
- Optional SES permissions

### `waf/` (Optional)
Creates AWS WAF Web ACL with:
- Rate limiting
- AWS Managed Rule Sets (Common, Known Bad Inputs)

## Directory Structure

```
infrastructure/terraform/
├── main.tf                    # Root module - orchestrates all modules
├── variables.tf             # Input variables
├── outputs.tf               # Output values
├── terraform.tfvars         # Your configuration (gitignored)
├── terraform.tfvars.example # Example configuration
├── modules/
│   ├── s3-static-website/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── cloudfront-cdn/
│   ├── contact-form-api/
│   ├── acm-certificate/
│   ├── route53-dns/
│   └── waf/
├── lambda/
│   └── contact-form.py
└── bootstrap/               # One-time setup for remote state
    └── main.tf
```

## Setup Instructions

### 1. One-Time Bootstrap (Remote State)

First, create an S3 bucket and DynamoDB table for Terraform state:

```bash
cd infrastructure/terraform/bootstrap

# Create terraform.tfvars
cat > terraform.tfvars <<EOF
bucket_name         = "your-terraform-state-bucket-unique"
dynamodb_table_name = "portfolio-terraform-locks"
EOF

terraform init
terraform apply
```

Note the `backend_config` output - you'll use this to configure remote state.

### 2. Configure Root Module

```bash
cd infrastructure/terraform

# Create your configuration
cat > terraform.tfvars <<EOF
domain_name               = "namanjain.dev"
aws_region                = "us-east-1"
project_name              = "portfolio"
environment               = "prod"
enable_waf                = false
enable_contact_form_email = false
contact_form_to_email     = "your-email@example.com"
contact_form_from_email   = "noreply@namanjain.dev"
EOF
```

### 3. Initialize with Remote State

Uncomment the backend block in `main.tf` and update with your values from bootstrap:

```hcl
terraform {
  backend "s3" {
    bucket         = "your-terraform-state-bucket-unique"
    key            = "portfolio/prod/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "portfolio-terraform-locks"
  }
}
```

Then initialize:

```bash
terraform init
```

### 4. Deploy Infrastructure

```bash
terraform plan
terraform apply
```

### 5. Update DNS

After apply, note the `name_servers` output:

```bash
terraform output name_servers
```

Update your domain registrar with these name servers.

## Outputs

| Output | Description | Example Use |
|--------|-------------|-------------|
| `s3_bucket_name` | S3 bucket | Deploy script, CI/CD |
| `cloudfront_distribution_id` | Distribution ID | Cache invalidation |
| `contact_form_api_endpoint` | API URL | Frontend .env |
| `name_servers` | Route53 NS | Domain registrar |
| `site_url` | Your site | Verification |

## Module Dependencies

```
acm-certificate
    ↓
route53-dns (needs validation options from ACM)
    ↓
s3-static-website
    ↓
cloudfront-cdn (needs S3 domain, ACM cert)
    ↓
contact-form-api (independent)
waf (optional, attaches to CloudFront)
```

## Customization

### Add Another Environment

```bash
# Create staging configuration
cp terraform.tfvars staging.tfvars
# Edit: environment = "staging", domain_name = "staging.namanjain.dev"

terraform workspace new staging
terraform apply -var-file=staging.tfvars
```

### Customize a Module

Each module is self-contained. Edit the module's files to customize behavior.

Example: Add WAF rules:

```hcl
# modules/waf/main.tf
# Add custom rules to the aws_wafv2_web_acl resource
```

## Costs

Approximate monthly costs:

| Service | Cost |
|---------|------|
| S3 | $0.023/GB |
| CloudFront | ~$0.085/GB (US) |
| Route53 | $0.50/zone + $0.40/million queries |
| ACM | Free |
| API Gateway | $3.50/million requests |
| Lambda | First 1M free |
| WAF (optional) | ~$5/month + $0.60/million requests |
| DynamoDB (state lock) | ~$1.25/month |

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Certificate validation fails | Check Route53 records match ACM domain_validation_options |
| S3 policy error | Ensure CloudFront ARN is correct and distribution exists |
| Lambda zip not found | Run `terraform apply` from correct directory |
| State locking | Check DynamoDB table exists and you have permissions |
