#!/bin/bash
# AWS Account Setup Script for CI/CD Deployment
# Run this script after creating your AWS account to set up initial resources

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  AWS Account Setup for CI/CD${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}AWS CLI is not installed. Please install it first:${NC}"
    echo "https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html"
    exit 1
fi

echo -e "${YELLOW}Step 1: Configure AWS CLI${NC}"
echo "You'll need your AWS Access Key ID and Secret Access Key"
echo "If you don't have these, create them in AWS Console > IAM > Users > Security credentials"
echo ""

# Check if already configured
if ! aws sts get-caller-identity &> /dev/null; then
    aws configure
else
    echo -e "${GREEN}AWS CLI already configured ✓${NC}"
    aws sts get-caller-identity
fi

echo ""
echo -e "${YELLOW}Step 2: Create IAM User for CI/CD${NC}"
read -p "Enter username for CI/CD user [github-actions]: " USERNAME
USERNAME=${USERNAME:-github-actions}

# Create IAM user
if aws iam get-user --user-name "$USERNAME" &> /dev/null; then
    echo -e "${GREEN}User $USERNAME already exists ✓${NC}"
else
    echo "Creating IAM user: $USERNAME..."
    aws iam create-user --user-name "$USERNAME"
    echo -e "${GREEN}User created ✓${NC}"
fi

# Attach policies
echo "Attaching required policies..."
POLICIES=(
    "arn:aws:iam::aws:policy/AmazonS3FullAccess"
    "arn:aws:iam::aws:policy/CloudFrontFullAccess"
    "arn:aws:iam::aws:policy/AWSLambda_FullAccess"
    "arn:aws:iam::aws:policy/AmazonAPIGatewayAdministrator"
    "arn:aws:iam::aws:policy/IAMFullAccess"
    "arn:aws:iam::aws:policy/AmazonRoute53FullAccess"
    "arn:aws:iam::aws:policy/AWSCertificateManagerFullAccess"
    "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess"
    "arn:aws:iam::aws:policy/AmazonSESFullAccess"
)

for POLICY in "${POLICIES[@]}"; do
    aws iam attach-user-policy --user-name "$USERNAME" --policy-arn "$POLICY" || true
done

echo -e "${GREEN}Policies attached ✓${NC}"

# Create access keys
echo ""
echo -e "${YELLOW}Step 3: Create Access Keys${NC}"
echo "Creating access keys for $USERNAME..."

ACCESS_KEY_OUTPUT=$(aws iam create-access-key --user-name "$USERNAME" 2>/dev/null || echo "")

if [ -z "$ACCESS_KEY_OUTPUT" ]; then
    echo -e "${YELLOW}Access keys already exist. Please use existing keys or delete old ones in AWS Console${NC}"
    echo "AWS Console > IAM > Users > $USERNAME > Security credentials"
else
    ACCESS_KEY_ID=$(echo "$ACCESS_KEY_OUTPUT" | jq -r '.AccessKey.AccessKeyId')
    SECRET_KEY=$(echo "$ACCESS_KEY_OUTPUT" | jq -r '.AccessKey.SecretAccessKey')

    echo ""
    echo -e "${GREEN}Access Key Created!${NC}"
    echo -e "${RED}IMPORTANT: Save these values - the secret key will not be shown again!${NC}"
    echo ""
    echo "AWS_ACCESS_KEY_ID: $ACCESS_KEY_ID"
    echo "AWS_SECRET_ACCESS_KEY: $SECRET_KEY"
    echo ""
    echo "Add these to your GitHub repository secrets:"
    echo "Settings > Secrets and variables > Actions > New repository secret"
fi

echo ""
echo -e "${YELLOW}Step 4: Generate unique bucket names${NC}"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
BUCKET_NAME="portfolio-terraform-state-$ACCOUNT_ID"

echo "Suggested Terraform state bucket name: $BUCKET_NAME"
echo "Suggested DynamoDB table name: terraform-locks"
echo ""

# Create a summary file
cat > aws-setup-summary.txt << EOF
AWS Setup Summary
=================

IAM User: $USERNAME
Account ID: $ACCOUNT_ID

Required GitHub Secrets:
------------------------
AWS_ACCESS_KEY_ID=<your_access_key_id>
AWS_SECRET_ACCESS_KEY=<your_secret_access_key>
AWS_REGION=us-east-1
TF_STATE_BUCKET=$BUCKET_NAME
TF_LOCK_TABLE=terraform-locks
DOMAIN_NAME=your-domain.com (optional - can use CloudFront domain)
CONTACT_EMAIL=your-email@example.com
PROJECT_NAME=portfolio
ENABLE_WAF=false
ENABLE_CONTACT_FORM=false
S3_BUCKET_NAME= (auto-generated if empty)

Manual Steps:
-------------
1. Add the secrets above to GitHub repository
2. Buy/register a domain (or use CloudFront domain initially)
3. Update Route53 nameservers if using custom domain
4. Request SES production access if using contact form emails

Next Commands:
--------------
1. Bootstrap Terraform backend:
   cd infrastructure/terraform/bootstrap
   terraform init
   terraform apply -var="bucket_name=$BUCKET_NAME" -var="dynamodb_table_name=terraform-locks"

2. Update main.tf with backend config (uncomment and configure backend block)

3. Push code to trigger GitHub Actions
EOF

echo -e "${GREEN}Setup summary saved to aws-setup-summary.txt${NC}"
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Next steps:"
echo "1. Copy the AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY to GitHub secrets"
echo "2. Read aws-setup-summary.txt for complete configuration"
echo "3. Bootstrap Terraform backend (instructions in summary file)"
echo "4. Push your code to trigger the CI/CD pipelines"
