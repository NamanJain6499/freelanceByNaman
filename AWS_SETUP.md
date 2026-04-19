# AWS Account Setup Guide

Complete setup for deploying your portfolio infrastructure and service.

## Prerequisites

- AWS account created (Free Tier is fine)
- AWS CLI installed locally: `aws --version`
- GitHub repository created

## Step 1: Initial Account Security

### 1.1 Enable MFA for Root User
```bash
# Login to AWS Console as root
# Go to: IAM → Security credentials → MFA → Activate MFA
# Use Authy or Google Authenticator
```

### 1.2 Create IAM Admin User (Don't use root!)
```bash
# In AWS Console:
# IAM → Users → Create user
# User name: yourname-admin
# Attach policies: AdministratorAccess
# Enable console access + CLI access
# Download the CSV with credentials
```

### 1.3 Configure AWS CLI
```bash
aws configure
# AWS Access Key ID: (from CSV)
# AWS Secret Access Key: (from CSV)
# Default region: us-east-1
# Default output format: json
```

## Step 2: Create OIDC Provider for GitHub

This allows GitHub Actions to authenticate without long-lived credentials.

```bash
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --thumbprint-list 6938fd4e98bab1fa863186ae26ebb0a0decd5e8d \
  --client-id-list sts.amazonaws.com

# Save the ARN output, you'll need it later
# Example: arn:aws:iam::123456789012:oidc-provider/token.actions.githubusercontent.com
```

## Step 3: Create IAM Roles

### 3.1 Terraform Role (for Infrastructure Pipeline)

Create trust policy file: `terraform-trust-policy.json`

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::YOUR_ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:YOUR_GITHUB_USERNAME/YOUR_REPO_NAME:*"
        }
      }
    }
  ]
}
```

Create the role:
```bash
aws iam create-role \
  --role-name GitHubActionsTerraformRole \
  --assume-role-policy-document file://terraform-trust-policy.json

# Attach AdministratorAccess (or scoped permissions below)
aws iam attach-role-policy \
  --role-name GitHubActionsTerraformRole \
  --policy-arn arn:aws:iam::aws:policy/AdministratorAccess

# Get the ARN
aws iam get-role \
  --role-name GitHubActionsTerraformRole \
  --query Role.Arn \
  --output text
# Save this: arn:aws:iam::ACCOUNT:role/GitHubActionsTerraformRole
```

### 3.2 App Role (for Service Pipeline)

Create trust policy file: `app-trust-policy.json` (same content as above, just different role name)

```bash
aws iam create-role \
  --role-name GitHubActionsAppRole \
  --assume-role-policy-document file://app-trust-policy.json

# Create custom policy for deployment
```

Create policy file: `app-deployment-policy.json`

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket",
        "s3:GetBucketLocation"
      ],
      "Resource": [
        "arn:aws:s3:::*",
        "arn:aws:s3:::*/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation",
        "cloudfront:GetInvalidation"
      ],
      "Resource": "*"
    }
  ]
}
```

Attach it:
```bash
aws iam put-role-policy \
  --role-name GitHubActionsAppRole \
  --policy-name AppDeploymentPolicy \
  --policy-document file://app-deployment-policy.json

# Get the ARN
aws iam get-role \
  --role-name GitHubActionsAppRole \
  --query Role.Arn \
  --output text
# Save this: arn:aws:iam::ACCOUNT:role/GitHubActionsAppRole
```

## Step 4: Bootstrap Terraform Backend

Your Terraform state needs to be stored remotely (S3 + DynamoDB).

### 4.1 Create S3 Bucket for State
```bash
aws s3 mb s3://yourname-terraform-state-portfolio --region us-east-1

aws s3api put-bucket-versioning \
  --bucket yourname-terraform-state-portfolio \
  --versioning-configuration Status=Enabled

aws s3api put-bucket-encryption \
  --bucket yourname-terraform-state-portfolio \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'
```

### 4.2 Create DynamoDB Table for Locking
```bash
aws dynamodb create-table \
  --table-name portfolio-terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

## Step 5: Configure GitHub Secrets

Go to your GitHub repository: `Settings → Secrets and variables → Actions → New repository secret`

Add these secrets:

| Secret Name | Value | From Step |
|-------------|-------|-----------|
| `TF_ROLE_ARN` | `arn:aws:iam::ACCOUNT:role/GitHubActionsTerraformRole` | 3.1 |
| `APP_ROLE_ARN` | `arn:aws:iam::ACCOUNT:role/GitHubActionsAppRole` | 3.2 |
| `DOMAIN_NAME` | `namanjain.dev` (your domain) | You |
| `CONTACT_EMAIL` | `your@email.com` | You |
| `S3_BUCKET_NAME` | *(leave empty for now)* | Will get from TF output |
| `CLOUDFRONT_DISTRIBUTION_ID` | *(leave empty for now)* | Will get from TF output |
| `CONTACT_API_URL` | *(leave empty for now)* | Will get from TF output |

## Step 6: First Deployment (Local)

### 6.1 Configure Terraform
```bash
cd infrastructure/terraform

# Create your config
cat > terraform.tfvars <<EOF
domain_name               = "namanjain.dev"
aws_region                = "us-east-1"
project_name              = "portfolio"
environment               = "prod"
enable_waf                = false
enable_contact_form_email = false
contact_form_to_email     = "your@email.com"
contact_form_from_email   = "noreply@namanjain.dev"
EOF

# Update backend in main.tf (uncomment and update)
# backend "s3" {
#   bucket         = "yourname-terraform-state-portfolio"
#   key            = "portfolio/prod/terraform.tfstate"
#   region         = "us-east-1"
#   encrypt        = true
#   dynamodb_table = "portfolio-terraform-locks"
# }
```

### 6.2 Deploy Infrastructure Locally
```bash
terraform init
terraform plan
terraform apply

# Note the outputs - you'll need these for GitHub secrets
terraform output
```

### 6.3 Update GitHub Secrets with Outputs
After `terraform apply` completes, update these secrets:

| Secret | Value from Output |
|--------|-------------------|
| `S3_BUCKET_NAME` | `s3_bucket_name` |
| `CLOUDFRONT_DISTRIBUTION_ID` | `cloudfront_distribution_id` |
| `CONTACT_API_URL` | `contact_form_api_endpoint` |

### 6.4 Update DNS
```bash
# Get nameservers
terraform output name_servers

# Update your domain registrar with these 4 nameservers
```

## Step 7: Verify CI/CD Works

### Test Infrastructure Pipeline
```bash
# Make a small change to infrastructure
echo "# Test" >> infrastructure/terraform/main.tf
git add .
git commit -m "Test infrastructure pipeline"
git push origin main
```

Watch in GitHub Actions: `infrastructure-deploy.yml` should run.

### Test Service Pipeline
```bash
# Make a small change to frontend
echo "// Test" >> app/frontend/src/App.jsx
git add .
git commit -m "Test service pipeline"
git push origin main
```

Watch in GitHub Actions: `service-deploy.yml` should run.

## Required IAM Permissions Summary

### Terraform Role Needs:
- S3 (Full)
- CloudFront (Full)
- Route53 (Full)
- ACM (Full)
- Lambda (Full)
- API Gateway (Full)
- IAM (Create roles/policies)
- WAFv2 (Full)
- DynamoDB (for state locking)

Or simply: `AdministratorAccess` (easiest for personal projects)

### App Role Needs:
- S3: PutObject, DeleteObject, ListBucket
- CloudFront: CreateInvalidation

## Cost Estimate (Free Tier + Beyond)

| Service | Free Tier | Monthly Cost |
|---------|-----------|--------------|
| S3 | 5GB free | $0.023/GB after |
| CloudFront | 50GB free | $0.085/GB after |
| Route53 | No free tier | $0.50/zone + $0.40/million queries |
| DynamoDB | 25GB free | Minimal |
| Lambda | 1M requests free | $0.20/million after |
| API Gateway | 1M requests free | $3.50/million after |

**Estimated: $0-5/month** (very low traffic)

## Troubleshooting

### "No OIDC provider found"
Run Step 2 to create the OIDC provider.

### "Access denied"
Check that your IAM user has permissions to create roles/policies.

### "Bucket already exists"
S3 bucket names are globally unique. Use a different name with your unique ID.

### "State locking failed"
Check DynamoDB table exists in us-east-1 and your role has access.

## Support

- AWS Free Tier: https://aws.amazon.com/free/
- OIDC Setup: https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_create_oidc.html
- Terraform AWS: https://registry.terraform.io/providers/hashicorp/aws/latest/docs
