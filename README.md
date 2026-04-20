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

| Secret | Value | Required |
|--------|-------|----------|
| `AWS_ROLE_ARN` | From step 1 | Yes |
| `TF_STATE_BUCKET` | `portfolio-terraform-state-<account-id>` | Yes |
| `DOMAIN_NAME` | Your domain (optional) | No |
| `CONTACT_EMAIL` | Your email | No |
| `PROJECT_NAME` | `portfolio` | No (defaults to portfolio) |
| `ENABLE_WAF` | `false` | No |
| `ENABLE_CONTACT_FORM` | `false` | No |

### 3. Deploy

```bash
git push origin main
```

Pushing triggers both pipelines:
- **Infrastructure CI/CD** - Creates AWS resources (~10 min)
- **Service CI/CD** - Deploys frontend (~5 min)

## Repository Structure

```
├── app/frontend/                    # React + TypeScript + Vite application
│   ├── src/
│   ├── dist/                        # Build output (generated)
│   └── package.json
│
├── infrastructure/
│   ├── terraform/                   # Infrastructure as Code
│   │   ├── main.tf                  # Main configuration
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   ├── bootstrap/               # One-time Terraform backend setup
│   │   └── modules/                 # Reusable modules
│   │       ├── s3-static-website/   # S3 bucket with OAC
│   │       ├── cloudfront-cdn/      # CloudFront distribution
│   │       ├── acm-certificate/     # SSL certificates
│   │       ├── route53-dns/         # DNS records
│   │       ├── contact-form-api/    # Lambda + API Gateway
│   │       └── waf/                 # Web Application Firewall
│   └── lambda/
│       └── contact-form.py          # Contact form handler
│
├── .github/workflows/               # CI/CD Pipelines
│   ├── infrastructure-cicd.yml      # Infrastructure deployment
│   └── service-cicd.yml             # Frontend + Lambda deployment
│
├── setup-oidc.sh                    # One-time AWS OIDC setup
├── DEPLOYMENT.md                    # Detailed deployment guide
└── README.md                        # This file
```

## Pipelines

### Infrastructure CI/CD

**Purpose:** Provision AWS resources using Terraform

**Triggers:**
- PR with infrastructure changes → Plan review
- Merge to main → Auto-deploy
- Manual trigger → Deploy or Destroy

**Creates:**
- S3 bucket (private, versioned, encrypted)
- CloudFront distribution (with OAC)
- Route53 zone and records (if domain provided)
- ACM certificate (us-east-1)
- Lambda + API Gateway (if enabled)
- WAF Web ACL (if enabled)

### Service CI/CD

**Purpose:** Build and deploy frontend

**Triggers:**
- Push to main with frontend changes
- Manual trigger (all, frontend-only, lambda-only)

**Steps:**
1. Get infrastructure outputs from Terraform state
2. Install dependencies and build with Vite
3. Deploy to S3 with optimized caching:
   - JS/CSS assets: immutable, 1 year cache
   - HTML files: no cache, must-revalidate
4. Invalidate CloudFront cache

**S3 Deployment Strategy:**
- Files are synced to S3 with proper Content-Type headers
- Hashed assets (JS/CSS) get long-term caching headers
- HTML files get no-cache headers for SPA routing
- CloudFront cache invalidation ensures fresh content

## Local Development

### Frontend Development

```bash
cd app/frontend
npm install
npm run dev        # Vite dev server at http://localhost:5173
npm run build      # Production build to dist/
npm run preview    # Preview production build locally
```

### Infrastructure Development

```bash
cd infrastructure/terraform

# Initialize (first time only)
terraform init

# Plan changes
terraform plan

# Apply changes (requires AWS credentials)
terraform apply
```

**Required Environment Variables for Local Terraform:**
```bash
export AWS_REGION=us-east-1
export TF_VAR_project_name=portfolio
export TF_VAR_environment=prod
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

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| **Black screen after deploy** | Wrong Content-Type on JS files | Hard refresh (Ctrl+F5) to clear cache |
| **CloudFront 403 error** | Missing index.html or wrong bucket policy | Verify S3 files and invalidate cache |
| **Changes not showing** | CloudFront caching | Wait 1-2 min or create invalidation |
| "Access Denied" | Wrong AWS_ROLE_ARN | Check secret matches OIDC setup output |
| "No outputs" | Infrastructure not deployed | Run Infrastructure CI/CD first |

## Documentation

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Complete deployment guide
- **GitHub Actions:** https://docs.github.com/actions
- **Terraform:** https://developer.hashicorp.com/terraform
- **AWS OIDC:** https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_create_oidc.html
