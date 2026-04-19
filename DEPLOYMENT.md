# CI/CD Deployment Guide

This guide explains how to deploy your portfolio website using separate CI/CD pipelines for Infrastructure and Services on AWS.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         AWS Cloud                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐        ┌──────────────────┐               │
│  │  S3 Bucket       │        │  CloudFront CDN  │               │
│  │  (Static Website)│◄───────│  (Edge Cache)    │               │
│  └──────────────────┘        └────────┬─────────┘               │
│                                       │                         │
│  ┌──────────────────┐        ┌───────▼────────┐               │
│  │  Lambda Function │        │  Route53 DNS   │               │
│  │  (Contact Form)  │        │  (Custom Domain)│               │
│  └──────────────────┘        └────────────────┘               │
│                                                                 │
│  ┌──────────────────┐                                           │
│  │  API Gateway     │                                           │
│  │  (HTTP Endpoint) │                                           │
│  └──────────────────┘                                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

CI/CD Pipelines:
================
┌─────────────────────┐      ┌─────────────────────┐
│ Infrastructure CI/CD │      │   Service CI/CD     │
├─────────────────────┤      ├─────────────────────┤
│ - Terraform         │      │ - Build Frontend    │
│ - S3/CloudFront     │      │ - Deploy to S3      │
│ - Lambda/API GW     │      │ - Invalidate CDN    │
│ - Route53/DNS       │      │ - Update Lambda     │
└─────────────────────┘      └─────────────────────┘
```

## Pipeline Separation

### 1. Infrastructure CI/CD (`infrastructure-cicd.yml`)
**Purpose:** Manages AWS infrastructure using Terraform

**Triggers:**
- Push to `main` branch affecting `infrastructure/terraform/**`
- Pull requests affecting infrastructure
- Manual trigger (`workflow_dispatch`)

**Jobs:**
1. **Bootstrap** - Creates S3 bucket and DynamoDB table for Terraform state
2. **Plan** - Runs `terraform plan` and posts results to PR (on PRs only)
3. **Deploy** - Runs `terraform apply` (on main branch merges)
4. **Destroy** - Runs `terraform destroy` (manual trigger only)

**Outputs:**
- S3 Bucket Name
- CloudFront Distribution ID
- API Gateway Endpoint
- Site URL

### 2. Service CI/CD (`service-cicd.yml`)
**Purpose:** Deploys application code (frontend and Lambda functions)

**Triggers:**
- Push to `main` branch affecting `app/frontend/**` or `infrastructure/lambda/**`
- Manual trigger with option to deploy `all`, `frontend-only`, or `lambda-only`

**Jobs:**
1. **Get Infrastructure Outputs** - Reads outputs from Terraform state
2. **Deploy Frontend** - Builds React app and deploys to S3
3. **Deploy Lambda** - Updates Lambda function code
4. **Summary** - Deployment summary report

## Prerequisites

### AWS Account Setup

1. **Create AWS Account** (if not already done)
   - Go to https://aws.amazon.com/free
   - Complete registration with Free Tier

2. **Create IAM User for CI/CD**
   ```bash
   # Run the setup script
   ./scripts/aws-setup.sh
   ```
   Or manually:
   - AWS Console → IAM → Users → Create user
   - Username: `github-actions`
   - Attach policies:
     - `AmazonS3FullAccess`
     - `CloudFrontFullAccess`
     - `AWSLambda_FullAccess`
     - `AmazonAPIGatewayAdministrator`
     - `IAMFullAccess`
     - `AmazonRoute53FullAccess`
     - `AWSCertificateManagerFullAccess`
     - `AmazonDynamoDBFullAccess`
     - `AmazonSESFullAccess`
   - Create access keys and save them securely

### GitHub Secrets Configuration

Add these secrets to your GitHub repository (Settings → Secrets → Actions):

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `AWS_ACCESS_KEY_ID` | IAM user access key | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | IAM user secret key | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `TF_STATE_BUCKET` | S3 bucket for Terraform state | `portfolio-terraform-state-123456789` |
| `TF_LOCK_TABLE` | DynamoDB table for state locking | `terraform-locks` |
| `DOMAIN_NAME` | Your custom domain | `namanjain.dev` |
| `CONTACT_EMAIL` | Email for contact form | `your@email.com` |
| `PROJECT_NAME` | Project name prefix | `portfolio` |
| `ENABLE_WAF` | Enable WAF (optional) | `false` |
| `ENABLE_CONTACT_FORM` | Enable SES emails (optional) | `false` |
| `S3_BUCKET_NAME` | S3 bucket name (optional - auto-generated) | `namanjain-dev-assets` |

### Domain Name (Optional but Recommended)

**Option A: Custom Domain**
1. Buy domain from Route53 or transfer existing domain
2. Set `DOMAIN_NAME` in GitHub secrets
3. Terraform will create Route53 hosted zone
4. Update nameservers at your domain registrar

**Option B: CloudFront Domain Only**
- Leave `DOMAIN_NAME` empty initially
- Use the CloudFront domain name (e.g., `d1234.cloudfront.net`)
- Update DNS later if desired

## Deployment Steps

### Step 1: Bootstrap Terraform Backend (One-time)

Before running CI/CD, bootstrap the Terraform backend:

```bash
cd infrastructure/terraform/bootstrap

# Initialize and apply
terraform init
terraform apply -var="bucket_name=YOUR_UNIQUE_BUCKET_NAME" \
                  -var="dynamodb_table_name=terraform-locks"

# Save the outputs
terraform output
```

### Step 2: Push Code to GitHub

```bash
git add .
git commit -m "Add CI/CD pipelines"
git push origin main
```

### Step 3: Run Infrastructure Pipeline

1. Go to GitHub Actions → **Infrastructure CI/CD**
2. Click **Run workflow** → **Run workflow**
3. Wait for completion (~5-10 minutes)

**Expected outputs:**
- S3 bucket created
- CloudFront distribution created
- Lambda function created
- API Gateway endpoint created
- (Optional) Route53 records created

### Step 4: Run Service Pipeline

1. Go to GitHub Actions → **Service CI/CD**
2. Click **Run workflow**
3. Select `deploy_target: all`
4. Click **Run workflow**
5. Wait for completion (~3-5 minutes)

**Expected outputs:**
- Frontend built and deployed to S3
- Lambda function code updated
- CloudFront cache invalidated

### Step 5: Verify Deployment

1. Get the CloudFront domain or custom domain:
   - Check GitHub Actions summary
   - Or run: `aws cloudfront list-distributions`

2. Visit your website in a browser

3. Test contact form (if enabled)

## Troubleshooting

### Issue: "No credentials found"
**Solution:** Add `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` to GitHub secrets

### Issue: "S3 bucket already exists"
**Solution:** Bucket names are global. Change `S3_BUCKET_NAME` or `DOMAIN_NAME` in secrets

### Issue: "CloudFront distribution not found"
**Solution:** Run Infrastructure CI/CD first before Service CI/CD

### Issue: "Lambda function not found"
**Solution:** Infrastructure must be deployed. Check function name matches in Terraform and CI/CD

### Issue: "Contact form not sending emails"
**Solution:** 
- AWS SES requires domain/email verification
- Set `ENABLE_CONTACT_FORM=true` in secrets
- Request SES production access from AWS (sandbox limits apply)

## Costs

All resources are within AWS Free Tier for 12 months:

| Service | Free Tier | Monthly Cost After |
|---------|-----------|---------------------|
| S3 | 5GB storage, 20K GET | ~$0.023/GB |
| CloudFront | 50GB data transfer | ~$0.085/GB |
| Lambda | 1M requests | ~$0.20/million |
| API Gateway | 1M REST calls | ~$3.50/million |
| Route53 | $0.50/hosted zone | $0.50/hosted zone |

**Estimated monthly cost:** $0-2 for low traffic

## Security Considerations

1. **IAM Permissions**: CI/CD user has broad permissions. Consider restricting further:
   - Use separate accounts for prod/staging
   - Implement OIDC instead of access keys (recommended)
   - Add IP restrictions

2. **Secrets**: Never commit AWS credentials to Git

3. **S3 Bucket**: Private by default, only accessible via CloudFront

4. **Lambda**: Least privilege IAM role for Lambda execution

## Advanced: Switch to OIDC (Recommended)

Instead of access keys, use OIDC for more secure authentication:

1. Create OIDC Identity Provider in AWS:
   - URL: `https://token.actions.githubusercontent.com`
   - Audience: `sts.amazonaws.com`

2. Create IAM role with trust policy:
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {"Federated": "arn:aws:iam::ACCOUNT:oidc-provider/token.actions.githubusercontent.com"},
    "Action": "sts:AssumeRoleWithWebIdentity",
    "Condition": {
      "StringEquals": {
        "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
        "token.actions.githubusercontent.com:sub": "repo:YOUR_USERNAME/HostStaticWebsite:ref:refs/heads/main"
      }
    }
  }]
}
```

3. Update GitHub workflows:
```yaml
- uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: arn:aws:iam::ACCOUNT:role/ROLE_NAME
    aws-region: us-east-1
```

## Maintenance

### Updating Infrastructure
- Modify files in `infrastructure/terraform/`
- Push to main branch
- Review plan in PR (if using PR workflow)
- Merge to apply changes

### Updating Application
- Modify files in `app/frontend/`
- Push to main branch
- Automatic deployment via Service CI/CD

### Manual Lambda Update
- Go to GitHub Actions → Service CI/CD
- Run workflow with `deploy_target: lambda-only`

## Support

For issues:
1. Check GitHub Actions logs
2. Review CloudWatch Logs for Lambda
3. Check AWS CloudTrail for API errors
4. Open GitHub issue with error details
