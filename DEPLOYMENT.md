# Deployment Guide - Portfolio Website on AWS

Complete guide to deploy your portfolio to AWS using GitHub Actions and OIDC authentication.

## Prerequisites

- AWS Account (Free Tier eligible)
- GitHub repository with your code
- Domain name (optional - can use CloudFront domain initially)

## Quick Start (3 Steps)

### Step 1: Run OIDC Setup Script

This creates a secure connection between GitHub Actions and AWS.

```bash
./setup-oidc.sh
```

Enter your AWS credentials when prompted (these are temporary and NOT saved).

**Output:** An IAM Role ARN like:
```
arn:aws:iam::478747265059:role/GitHubActions-Portfolio-Role
```

### Step 2: Configure GitHub Secrets

Go to: `GitHub Repo > Settings > Secrets and variables > Actions > New repository secret`

| Secret Name | Value |
|-------------|-------|
| `AWS_ROLE_ARN` | From Step 1 |
| `TF_STATE_BUCKET` | `portfolio-terraform-state-478747265059` |
| `TF_LOCK_TABLE` | `terraform-locks` |
| `DOMAIN_NAME` | Your domain (optional) |
| `CONTACT_EMAIL` | Your email |
| `PROJECT_NAME` | `portfolio` |
| `ENABLE_WAF` | `false` |
| `ENABLE_CONTACT_FORM` | `false` |

### Step 3: Push to Deploy

```bash
git add .
git commit -m "Deploy portfolio"
git push origin main
```

This triggers:
1. **Infrastructure CI/CD** - Creates S3, CloudFront, Lambda (~10 min)
2. **Service CI/CD** - Deploys frontend and code (~5 min)

### Step 4: Access Your Site

Check the GitHub Actions summary for your site URL.

## Architecture

```
GitHub Actions (OIDC)
         │
         │ Assume Role
         ▼
    ┌─────────┐     ┌─────────────┐     ┌──────────┐
    │    S3   │◄────│ CloudFront  │────►│ Route53  │
    │(Website)│     │    (CDN)    │     │ (DNS)    │
    └─────────┘     └─────────────┘     └──────────┘
                           │
                    ┌──────▼──────┐
                    │ API Gateway │
                    │   + Lambda  │
                    │(Contact Form)│
                    └─────────────┘
```

## Custom Domain (Optional)

1. Buy/register a domain
2. Update `DOMAIN_NAME` secret
3. Get nameservers from Terraform output
4. Update nameservers at your registrar
5. Wait for DNS propagation (minutes to hours)

## Enable Contact Form (Optional)

1. Request SES production access in AWS Console
2. Update secrets:
   ```
   ENABLE_CONTACT_FORM=true
   CONTACT_EMAIL=your-verified@email.com
   ```
3. Re-run Infrastructure CI/CD

## Cost Estimate

| Service | Free Tier | Monthly Cost |
|---------|-----------|--------------|
| S3 | 5GB free | ~$0.023/GB |
| CloudFront | 50GB free | ~$0.085/GB |
| Route53 | - | ~$0.50/zone |
| Lambda | 1M requests free | ~$0.20/million |
| API Gateway | 1M requests free | ~$3.50/million |

**Estimated: $0-3/month** for low traffic

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Access Denied" | Check `AWS_ROLE_ARN` secret |
| "Bucket exists" | Change `TF_STATE_BUCKET` to unique name |
| "No outputs" | Run Infrastructure CI/CD first |
| Domain not working | Check nameservers, wait for propagation |

## Security

- No long-term credentials - Uses OIDC
- Terraform state encrypted in S3
- State locking with DynamoDB
- HTTPS enabled by default
