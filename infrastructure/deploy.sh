#!/bin/bash
set -e

# Deploy script for S3 + CloudFront
# Usage: ./deploy.sh [environment]

ENVIRONMENT="${1:-prod}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
FRONTEND_DIR="$PROJECT_ROOT/app/frontend"
TERRAFORM_DIR="$SCRIPT_DIR/terraform"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "==================================="
echo "Portfolio Deployment"
echo "Environment: $ENVIRONMENT"
echo "==================================="
echo ""

# Check prerequisites
command -v aws >/dev/null 2>& || { echo -e "${RED}Error: AWS CLI is required${NC}"; exit 1; }
command -v terraform >/dev/null 2>& || { echo -e "${RED}Error: Terraform is required${NC}"; exit 1; }

# Check if terraform outputs exist
if [ ! -f "$TERRAFORM_DIR/terraform.tfstate" ]; then
  echo -e "${YELLOW}Warning: Terraform state not found. Running terraform apply first...${NC}"
  cd "$TERRAFORM_DIR"
  terraform init
  terraform apply -auto-approve
fi

# Load Terraform outputs
echo "Loading Terraform outputs..."
cd "$TERRAFORM_DIR"
BUCKET_NAME=$(terraform output -raw s3_bucket_name 2>/dev/null || echo "")
DISTRIBUTION_ID=$(terraform output -raw cloudfront_distribution_id 2>/dev/null || echo "")
API_ENDPOINT=$(terraform output -raw contact_form_api_endpoint 2>/dev/null || echo "")
DOMAIN_NAME=$(terraform output -raw site_url 2>/dev/null | sed 's|https://||' || echo "")

if [ -z "$BUCKET_NAME" ] || [ -z "$DISTRIBUTION_ID" ]; then
  echo -e "${RED}Error: Could not get required values from Terraform.${NC}"
  echo "Make sure you've run: cd $TERRAFORM_DIR && terraform apply"
  exit 1
fi

echo -e "${GREEN}✓${NC} S3 Bucket: $BUCKET_NAME"
echo -e "${GREEN}✓${NC} CloudFront Distribution: $DISTRIBUTION_ID"
echo -e "${GREEN}✓${NC} API Endpoint: $API_ENDPOINT"
echo -e "${GREEN}✓${NC} Domain: $DOMAIN_NAME"
echo ""

# Update frontend env file with API endpoint
if [ -n "$API_ENDPOINT" ]; then
  echo "Updating frontend environment..."
  echo "VITE_CONTACT_API_URL=$API_ENDPOINT" > "$FRONTEND_DIR/.env"
fi

# Build frontend
echo "Building frontend..."
cd "$FRONTEND_DIR"

if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm ci
fi

npm run build

if [ ! -d "dist" ]; then
  echo -e "${RED}Error: Build failed - dist folder not found${NC}"
  exit 1
fi

echo -e "${GREEN}✓${NC} Build complete"
echo ""

# Sync to S3 with proper cache headers
echo "Deploying to S3..."

# Sync hashed assets (JS, CSS) with long cache
echo "Uploading static assets..."
aws s3 sync dist/ "s3://$BUCKET_NAME/" \
  --delete \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "*.html" \
  --exclude "*.txt" \
  --exclude "*.xml"

# Sync HTML files with no-cache
echo "Uploading HTML files..."
aws s3 sync dist/ "s3://$BUCKET_NAME/" \
  --cache-control "public, max-age=0, must-revalidate" \
  --content-type "text/html; charset=utf-8" \
  --include "*.html" \
  --exclude "*"

# Sync other files with moderate caching
echo "Uploading other files..."
aws s3 sync dist/ "s3://$BUCKET_NAME/" \
  --cache-control "public, max-age=86400" \
  --include "*.txt" \
  --include "*.xml" \
  --exclude "*"

echo -e "${GREEN}✓${NC} S3 sync complete"
echo ""

# Invalidate CloudFront
echo "Invalidating CloudFront cache..."
INVALIDATION_ID=$(aws cloudfront create-invalidation \
  --distribution-id "$DISTRIBUTION_ID" \
  --paths "/index.html" "/" \
  --query Invalidation.Id --output text)

echo -e "${GREEN}✓${NC} CloudFront invalidation created: $INVALIDATION_ID"
echo ""

# Summary
echo "==================================="
echo -e "${GREEN}Deployment Complete!${NC}"
echo "==================================="
echo "Site: https://$DOMAIN_NAME"
echo "Invalidate: $INVALIDATION_ID"
echo ""
echo -e "${YELLOW}Note: CloudFront propagation may take 1-5 minutes${NC}"
