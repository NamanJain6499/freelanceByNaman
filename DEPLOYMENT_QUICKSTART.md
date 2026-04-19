# Quick Start - Deploy Your Portfolio

## What Was Fixed

### Previous Issues
1. **Chicken-and-egg problem**: Service deployment needed secrets that only existed after infrastructure deployment
2. **No remote state**: Terraform state was local, causing issues in CI/CD
3. **No bootstrap process**: Backend resources (S3/DynamoDB) weren't created automatically

### Solutions Applied
1. **Unified Infrastructure CI/CD** (`infrastructure-cicd.yml`):
   - Auto-creates backend resources (bootstrap job)
   - Uses remote Terraform state (S3 + DynamoDB)
   - Separates plan (PR) and apply (main) phases
   - Includes destroy capability

2. **Improved Service CI/CD** (`service-cicd.yml`):
   - Reads infrastructure outputs directly from Terraform state
   - No dependency on GitHub secrets for dynamic values
   - Separate jobs for frontend and Lambda deployment
   - Manual deployment options

3. **Added Terraform Outputs**:
   - Lambda function name exposed
   - All infrastructure values available programmatically

## Deployment Steps (5 Minutes)

### Step 1: AWS Setup (Run Once)

```bash
# Run the automated setup script
./scripts/aws-setup.sh
```

Or manually:
1. AWS Console → IAM → Users → Create user `github-actions`
2. Attach policies: S3, CloudFront, Lambda, API Gateway, IAM, Route53, ACM, DynamoDB, SES
3. Create access keys → **Save them securely**

### Step 2: Configure GitHub Secrets

Go to your GitHub repo → Settings → Secrets → Actions → New repository secret:

```
AWS_ACCESS_KEY_ID=AKIA... (from Step 1)
AWS_SECRET_ACCESS_KEY=xxxxxxxx... (from Step 1)
TF_STATE_BUCKET=portfolio-terraform-state-YOUR_ACCOUNT_ID
TF_LOCK_TABLE=terraform-locks
DOMAIN_NAME=your-domain.com (optional)
CONTACT_EMAIL=your@email.com
PROJECT_NAME=portfolio
ENABLE_WAF=false
ENABLE_CONTACT_FORM=false
```

### Step 3: Push Code

```bash
git add .
git commit -m "Add CI/CD pipelines"
git push origin main
```

### Step 4: Run Infrastructure Pipeline

1. GitHub → Actions → **Infrastructure CI/CD**
2. Click **Run workflow**
3. Wait ~10 minutes

**What it creates:**
- S3 bucket for your website
- CloudFront distribution
- Lambda function for contact form
- API Gateway endpoint
- Route53 records (if domain provided)

### Step 5: Run Service Pipeline

1. GitHub → Actions → **Service CI/CD**
2. Click **Run workflow** → Keep default (`deploy_target: all`)
3. Wait ~5 minutes

**What it deploys:**
- React frontend → S3
- Lambda code → AWS Lambda
- CloudFront cache invalidation

### Step 6: Access Your Site

Check the GitHub Actions summary for:
- **Site URL**: https://your-domain.com (or CloudFront domain)
- **API Endpoint**: For contact form

## Files Changed

```
.github/workflows/
├── infrastructure-cicd.yml      # NEW - Complete infrastructure pipeline
└── service-cicd.yml            # NEW - Complete service deployment pipeline

infrastructure/terraform/
├── main.tf                       # MODIFIED - Backend config
└── outputs.tf                    # MODIFIED - Added lambda_function_name output

infrastructure/lambda/
└── requirements.txt              # NEW - Lambda dependencies

scripts/
└── aws-setup.sh                  # NEW - AWS account setup script

DEPLOYMENT.md                     # NEW - Complete deployment guide
DEPLOYMENT_QUICKSTART.md          # NEW - This file
```

## Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Infrastructure CI/CD                        │
├─────────────────────────────────────────────────────────────┤
│  Bootstrap → Plan (PR) → Deploy (Main) → Destroy (Manual)  │
│                                                              │
│  • Creates S3 backend for Terraform state                   │
│  • Provisions all AWS resources                             │
│  • Stores state remotely (S3 + DynamoDB)                   │
│  • Outputs: bucket_name, distribution_id, api_endpoint     │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ reads outputs
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Service CI/CD                             │
├─────────────────────────────────────────────────────────────┤
│  Get Outputs → Build Frontend → Deploy Lambda → Summary     │
│                                                              │
│  • Pulls infrastructure values from Terraform state           │
│  • No manual secret management needed                       │
│  • Separate frontend and Lambda deployment                   │
│  • Automatic CloudFront invalidation                        │
└─────────────────────────────────────────────────────────────┘
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `Access Denied` in CI/CD | Check IAM permissions in `aws-setup.sh` |
| `Bucket already exists` | Change `TF_STATE_BUCKET` to a unique name |
| `No outputs found` | Run Infrastructure CI/CD first |
| Lambda update fails | Check function name matches in Terraform output |

## Next Steps After Deployment

1. **Custom Domain** (optional):
   - Buy domain via Route53 or transfer existing
   - Update `DOMAIN_NAME` secret
   - Update nameservers at registrar
   - Re-run Infrastructure CI/CD

2. **Contact Form** (optional):
   - Request AWS SES production access
   - Set `ENABLE_CONTACT_FORM=true`
   - Verify domain/email in SES console

3. **Customizations**:
   - Edit files in `app/frontend/src/`
   - Push changes → Automatic deployment via Service CI/CD

## Important Notes

- **First run only**: Bootstrap creates S3 bucket for Terraform state
- **Costs**: All resources within AWS Free Tier (12 months)
- **Security**: Credentials only in GitHub secrets, never in code
- **State**: Terraform state stored in S3 with DynamoDB locking

## Full Documentation

See `DEPLOYMENT.md` for detailed instructions including:
- OIDC authentication (more secure)
- Cost estimates
- Security considerations
- Maintenance procedures
