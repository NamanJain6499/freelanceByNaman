# Portfolio Infrastructure

Static portfolio website deployed to AWS using S3 + CloudFront with OIDC-based GitHub Actions CI/CD.

## Architecture

```
GitHub Actions (OIDC Auth)
         │
         ▼
┌──────────────────────────────────────────────────────────────┐
│                           AWS                                 │
├──────────────────────────────────────────────────────────────┤
│  ┌───────────┐      ┌─────────────┐      ┌──────────┐     │
│  │   S3      │◄─────│  CloudFront │─────►│ Route53  │     │
│  │(Website)  │      │    (CDN)    │      │ (DNS)    │     │
│  └───────────┘      └─────────────┘      └──────────┘     │
│                            │                                  │
│                     ┌──────▼──────┐                          │
│                     │ API Gateway │                          │
│                     │   + Lambda  │                          │
│                     │(Contact Form)│                         │
│                     └─────────────┘                           │
└──────────────────────────────────────────────────────────────┘
```

## Quick Start

### 1. One-Time AWS Setup

```bash
./setup-oidc.sh
```

Enter your AWS credentials when prompted. Save the **Role ARN** output.

### 2. Configure GitHub Secrets

Go to: `Settings → Secrets and variables → Actions`

| Secret | Value |
|--------|-------|
| `AWS_ROLE_ARN` | From step 1 |
| `TF_STATE_BUCKET` | `portfolio-terraform-state-478747265059` |
| `TF_LOCK_TABLE` | `terraform-locks` |
| `DOMAIN_NAME` | Your domain (optional) |
| `CONTACT_EMAIL` | Your email |
| `PROJECT_NAME` | `portfolio` |
| `ENABLE_WAF` | `false` |
| `ENABLE_CONTACT_FORM` | `false` |

### 3. Deploy

```bash
git push origin main
```

Pushing triggers both pipelines:
- **Infrastructure CI/CD** - Creates AWS resources (~10 min)
- **Service CI/CD** - Deploys frontend (~5 min)

## Repository Structure

```
├── app/frontend/                    # React application
│   ├── src/
│   └── package.json
│
├── infrastructure/
│   ├── terraform/                   # Infrastructure as Code
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   └── modules/                 # Reusable modules
│   │       ├── s3-static-website/
│   │       ├── cloudfront-cdn/
│   │       ├── acm-certificate/
│   │       ├── route53-dns/
│   │       ├── contact-form-api/
│   │       └── waf/
│   ├── terraform/bootstrap/         # One-time backend setup
│   └── lambda/
│       └── contact-form.py
│
├── .github/workflows/               # CI/CD Pipelines
│   ├── infrastructure-cicd.yml    # Infrastructure deployment
│   └── service-cicd.yml           # Frontend + Lambda deployment
│
├── setup-oidc.sh                    # One-time AWS setup
└── DEPLOYMENT.md                    # Full deployment guide
```

## Pipelines

### Infrastructure CI/CD

**Purpose:** Provision AWS resources using Terraform

**Triggers:**
- PR with infrastructure changes → Plan review
- Merge to main → Auto-deploy
- Manual trigger → Deploy or Destroy

**Creates:**
- S3 bucket (private, versioned)
- CloudFront distribution (with OAC)
- Route53 zone and records (if domain provided)
- ACM certificate
- Lambda + API Gateway

### Service CI/CD

**Purpose:** Build and deploy frontend

**Triggers:**
- Push to main with frontend changes
- Manual trigger (all, frontend-only, lambda-only)

**Steps:**
1. Get infrastructure outputs from Terraform state
2. Install dependencies and build
3. Deploy to S3 (optimized caching)
4. Invalidate CloudFront

## Local Development

```bash
# Frontend
cd app/frontend
npm install
npm run dev        # http://localhost:5173

# Infrastructure (dry-run)
cd infrastructure/terraform
terraform plan
```

## Custom Domain

1. Buy/register a domain
2. Update `DOMAIN_NAME` secret
3. Get nameservers from Terraform output
4. Update nameservers at registrar
5. Wait for DNS propagation

## Enable Contact Form

1. Request SES production access in AWS Console
2. Update secrets: `ENABLE_CONTACT_FORM=true`
3. Verify email in SES console
4. Re-run Infrastructure CI/CD

## Costs

| Service | Monthly |
|---------|---------|
| S3 | $0.023/GB |
| CloudFront | $0.085/GB |
| Route53 | $0.50/zone |
| Lambda | Free (1M requests) |
| API Gateway | Free (1M requests) |
| **Total** | **$0-5** |

## Documentation

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Complete deployment guide
- **GitHub Actions:** https://docs.github.com/actions
- **Terraform:** https://developer.hashicorp.com/terraform
- **AWS OIDC:** https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_create_oidc.html
