# Portfolio Infrastructure

Static portfolio website deployed to AWS using S3 + CloudFront with separate Infrastructure and Service pipelines.

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    INFRASTRUCTURE PIPELINE                   │
│                    (Terraform → AWS)                         │
├──────────────────────────────────────────────────────────────┤
│  S3 Bucket (Private)                                         │
│  CloudFront CDN (with OAC)                                    │
│  Route53 DNS + ACM Certificate                               │
│  Lambda + API Gateway (Contact Form)                         │
└──────────────────────────────────────────────────────────────┘
                              │
                              │ (Outputs stored in GitHub Secrets)
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                      SERVICE PIPELINE                        │
│                  (Build → Deploy to S3)                      │
├──────────────────────────────────────────────────────────────┤
│  Vite React App                                               │
│    ├── npm ci                                                 │
│    ├── npm run build                                          │
│    ├── aws s3 sync                                            │
│    └── cloudfront invalidation                                │
└──────────────────────────────────────────────────────────────┘
```

## Repository Structure

```
├── app/frontend/                    # React application
│   ├── src/
│   └── package.json
│
├── infrastructure/                  # Infrastructure as Code
│   ├── terraform/
│   │   ├── main.tf                 # Root module (uses modules/)
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   ├── terraform.tfvars.example
│   │   ├── modules/                # 6 reusable modules
│   │   │   ├── s3-static-website/
│   │   │   ├── cloudfront-cdn/
│   │   │   ├── acm-certificate/
│   │   │   ├── route53-dns/
│   │   │   ├── contact-form-api/
│   │   │   └── waf/
│   │   ├── bootstrap/              # One-time backend setup
│   │   └── lambda/
│   │       └── contact-form.py
│   └── deploy.sh                   # Local deploy script
│
└── .github/workflows/              # CI/CD Pipelines
    ├── infrastructure-plan.yml     # PR review
    ├── infrastructure-deploy.yml   # Provision AWS
    ├── service-deploy.yml          # Deploy frontend
    └── README.md
```

## Quick Start

### 1. One-Time Setup

```bash
# Clone and enter directory
cd infrastructure/terraform/bootstrap

# Create backend for Terraform state
cat > terraform.tfvars <<EOF
bucket_name         = "yourname-terraform-state-uniquename"
dynamodb_table_name = "portfolio-terraform-locks"
EOF

terraform init && terraform apply

cd ..

# Configure infrastructure
cp terraform.tfvars.example terraform.tfvars
# Edit: domain_name = "yourdomain.com"

# Deploy infrastructure
terraform init
terraform apply

# Copy outputs to GitHub Secrets (see below)
terraform output
```

### 2. Configure GitHub Secrets

Go to: `Settings → Secrets → Actions`

**Infrastructure Pipeline:**
- `TF_ROLE_ARN` - IAM role for Terraform
- `DOMAIN_NAME` - Your domain
- `CONTACT_EMAIL` - Your email

**Service Pipeline:**
- `APP_ROLE_ARN` - IAM role for deployment
- `S3_BUCKET_NAME` - From `terraform output s3_bucket_name`
- `CLOUDFRONT_DISTRIBUTION_ID` - From `terraform output cloudfront_distribution_id`
- `CONTACT_API_URL` - From `terraform output contact_form_api_endpoint`

### 3. Deploy

Push to GitHub:
- Infrastructure changes → `infrastructure-deploy.yml`
- Frontend changes → `service-deploy.yml`

Or trigger manually from GitHub Actions tab.

## Pipelines Explained

### Pipeline 1: Infrastructure

**Purpose:** Provision AWS resources using Terraform

**Triggers:**
- PR with `infrastructure/terraform/**` changes → Plan review
- Merge to main → Auto-deploy

**What it creates:**
- S3 bucket (private, versioned)
- CloudFront distribution (with OAC)
- Route53 zone and records
- ACM certificate
- Lambda + API Gateway

**Outputs:** Bucket name, Distribution ID, API endpoint (stored as artifacts)

### Pipeline 2: Service

**Purpose:** Build and deploy frontend to S3

**Triggers:**
- Push to main with `app/frontend/**` changes
- Manual trigger

**Steps:**
1. Install dependencies
2. Build with Vite
3. Sync to S3 (hashed assets: long cache, HTML: no-cache)
4. Invalidate CloudFront

**Dependencies:** Infrastructure must be deployed first (for secrets)

## Local Development

```bash
# Frontend
cd app/frontend
npm install
npm run dev        # http://localhost:5173

# Infrastructure (dry-run)
cd infrastructure/terraform
terraform plan

# Full local deploy
cd infrastructure
./deploy.sh
```

## AWS Setup

### Create OIDC Provider
```bash
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --thumbprint-list 6938fd4e98bab1fa863186ae26ebb0a0decd5e8d \
  --client-id-list sts.amazonaws.com
```

### Create IAM Roles

**Terraform Role** - Trust policy:
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {
      "Federated": "arn:aws:iam::ACCOUNT:oidc-provider/token.actions.githubusercontent.com"
    },
    "Action": "sts:AssumeRoleWithWebIdentity",
    "Condition": {
      "StringEquals": {
        "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
        "token.actions.githubusercontent.com:sub": "repo:USERNAME/REPO:*"
      }
    }
  }]
}
```
Permissions: `AdministratorAccess` (or scoped)

**App Role** - Same trust, permissions:
- `s3:PutObject`, `s3:DeleteObject`, `s3:ListBucket`
- `cloudfront:CreateInvalidation`

## Environment Variables

### Frontend (.env)
```
VITE_CONTACT_API_URL=https://xxx.execute-api.us-east-1.amazonaws.com/prod/contact
```

### Terraform (terraform.tfvars)
```hcl
domain_name               = "yourdomain.com"
aws_region                = "us-east-1"
enable_waf                = false
enable_contact_form_email = false
contact_form_to_email     = "you@email.com"
contact_form_from_email   = "noreply@yourdomain.com"
```

## Costs

| Service | Monthly |
|---------|---------|
| S3 | $0.023/GB |
| CloudFront | $0.085/GB |
| Route53 | $0.50/zone |
| Lambda | Free (1M requests) |
| API Gateway | $3.50/million |
| **Total** | **~$5-10** |

## Workflow Independence

| Aspect | Infrastructure | Service |
|--------|--------------|---------|
| **Trigger** | Terraform changes | Frontend changes |
| **Deploys** | AWS resources | S3 static files |
| **Frequency** | Rarely | Often |
| **Dependencies** | None | Requires infrastructure |
| **Can run alone?** | Yes | Yes (if secrets exist) |

## Support

- GitHub Actions: https://docs.github.com/actions
- Terraform: https://developer.hashicorp.com/terraform
- AWS OIDC: https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_create_oidc.html
