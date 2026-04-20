#!/bin/bash
# Complete OIDC Setup for GitHub Actions
# This script sets up OIDC authentication so GitHub Actions can deploy to AWS
# without long-lived credentials

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

ACCOUNT_ID="478747265059"
REPO="NamanJain6499/freelanceByNaman"
ROLE_NAME="GitHubActions-Portfolio-Role"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  AWS OIDC Setup for GitHub Actions${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Account ID:${NC} $ACCOUNT_ID"
echo -e "${BLUE}Repository:${NC} $REPO"
echo ""
echo -e "${YELLOW}This script will:${NC}"
echo "  1. Create OIDC Identity Provider for GitHub"
echo "  2. Create IAM Role for GitHub Actions"
echo "  3. Attach required policies"
echo ""
echo -e "${YELLOW}You need temporary AWS credentials with IAM permissions${NC}"
echo "(These are NOT saved - only used for this setup)"
echo ""

# Get AWS credentials
read -s -p "Enter AWS Access Key ID: " ACCESS_KEY
echo ""
read -s -p "Enter AWS Secret Access Key: " SECRET_KEY
echo ""

export AWS_ACCESS_KEY_ID="$ACCESS_KEY"
export AWS_SECRET_ACCESS_KEY="$SECRET_KEY"
export AWS_DEFAULT_REGION="us-east-1"

# Clear credentials from display
unset ACCESS_KEY
unset SECRET_KEY

echo ""
echo -e "${YELLOW}Testing credentials...${NC}"
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ Invalid credentials${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Credentials valid!${NC}"
echo ""

# Step 1: Create OIDC Provider
echo -e "${YELLOW}Step 1: Creating OIDC Identity Provider...${NC}"

OIDC_EXISTS=$(aws iam list-open-id-connect-providers --query "OpenIDConnectProviderList[?contains(Arn, 'token.actions.githubusercontent.com')]" --output text)

if [ -n "$OIDC_EXISTS" ]; then
    echo -e "${GREEN}✅ OIDC Provider already exists${NC}"
else
    aws iam create-open-id-connect-provider \
        --url https://token.actions.githubusercontent.com \
        --thumbprint-list 6938fd4e98bab1faadb97b34396831e3780aea1 \
        --client-id-list sts.amazonaws.com
    echo -e "${GREEN}✅ OIDC Provider created${NC}"
fi

# Step 2: Create IAM Role
echo ""
echo -e "${YELLOW}Step 2: Creating IAM Role...${NC}"

# Create trust policy
cat > /tmp/trust-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::${ACCOUNT_ID}:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:${REPO}:*"
        }
      }
    }
  ]
}
EOF

ROLE_EXISTS=$(aws iam get-role --role-name "$ROLE_NAME" --query "Role.RoleName" --output text 2>/dev/null || echo "")

if [ -n "$ROLE_EXISTS" ]; then
    echo -e "${GREEN}✅ IAM Role already exists${NC}"
else
    aws iam create-role \
        --role-name "$ROLE_NAME" \
        --assume-role-policy-document file:///tmp/trust-policy.json \
        --description "Role for GitHub Actions to deploy portfolio" \
        &> /dev/null
    echo -e "${GREEN}✅ IAM Role created${NC}"
fi

# Step 3: Attach policies
echo ""
echo -e "${YELLOW}Step 3: Attaching policies...${NC}"

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
    aws iam attach-role-policy \
        --role-name "$ROLE_NAME" \
        --policy-arn "$POLICY" 2>/dev/null || true
done

echo -e "${GREEN}✅ Policies attached${NC}"

# Cleanup
rm -f /tmp/trust-policy.json

# Clear credentials
unset AWS_ACCESS_KEY_ID
unset AWS_SECRET_ACCESS_KEY

ROLE_ARN="arn:aws:iam::${ACCOUNT_ID}:role/${ROLE_NAME}"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Setup Complete! ✅${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}ROLE ARN (save this):${NC}"
echo -e "${YELLOW}$ROLE_ARN${NC}"
echo ""
echo "Add this to your GitHub Secrets:"
echo "  Settings > Secrets and variables > Actions > New repository secret"
echo ""
echo -e "${BLUE}Secret Name:${NC} AWS_ROLE_ARN"
echo -e "${BLUE}Secret Value:${NC} $ROLE_ARN"
echo ""
echo -e "${YELLOW}Other required secrets:${NC}"
echo "  TF_STATE_BUCKET=portfolio-terraform-state-$ACCOUNT_ID"
echo "  TF_LOCK_TABLE=terraform-locks"
echo "  DOMAIN_NAME=your-domain.com (optional)"
echo "  CONTACT_EMAIL=your@email.com"
echo "  PROJECT_NAME=portfolio"
echo "  ENABLE_WAF=false"
echo "  ENABLE_CONTACT_FORM=false"
