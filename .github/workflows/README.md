# GitHub Actions Workflows

Two independent pipelines for infrastructure and service deployment.

## Pipelines

### Pipeline 1: Infrastructure (Terraform)

| Workflow | File | Trigger | Purpose |
|----------|------|---------|---------|
| **Plan** | `infrastructure-plan.yml` | PR with Terraform changes | Preview changes, post plan to PR |
| **Deploy** | `infrastructure-deploy.yml` | Merge to main + Terraform changes | Provision AWS infrastructure |

### Pipeline 2: Service (Frontend)

| Workflow | File | Trigger | Purpose |
|----------|------|---------|---------|
| **Deploy** | `service-deploy.yml` | Push to main + Frontend changes | Build and deploy to S3 |

## Workflow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    PIPELINE 1: INFRASTRUCTURE                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  PR with Terraform changes                                      │
│       │                                                         │
│       ▼                                                         │
│  ┌─────────────────────┐                                        │
│  │ infrastructure-plan │                                        │
│  │ • terraform fmt     │                                        │
│  │ • terraform validate  │                                        │
│  │ • terraform plan      │                                        │
│  │ • Post plan to PR     │                                        │
│  └─────────────────────┘                                        │
│       │                                                         │
│       ▼                                                         │
│  Merge to main                                                  │
│       │                                                         │
│       ▼                                                         │
│  ┌─────────────────────┐                                        │
│  │ infrastructure-deploy│                                       │
│  │ • terraform apply   │                                        │
│  │ • Export outputs    │                                        │
│  │ • Upload artifacts  │                                        │
│  └─────────────────────┘                                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ (Manual step: Copy outputs to secrets)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      PIPELINE 2: SERVICE                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  PR with Frontend changes                                       │
│       │                                                         │
│       │ (No workflow - code review only)                        │
│       ▼                                                         │
│  Merge to main                                                  │
│       │                                                         │
│       ▼                                                         │
│  ┌─────────────────────┐                                        │
│  │   service-deploy    │                                        │
│  │ • npm ci            │                                        │
│  │ • npm run build     │                                        │
│  │ • aws s3 sync       │                                        │
│  │ • cloudfront invalid│                                        │
│  └─────────────────────┘                                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Required Secrets

### Infrastructure Pipeline Secrets

| Secret | Description | Used In |
|--------|-------------|---------|
| `TF_ROLE_ARN` | IAM role ARN for Terraform OIDC | `infrastructure-plan.yml`, `infrastructure-deploy.yml` |
| `DOMAIN_NAME` | Your domain (e.g., namanjain.dev) | Both infrastructure workflows |
| `CONTACT_EMAIL` | Email for contact form | Both infrastructure workflows |

### Service Pipeline Secrets

| Secret | Description | How to Get |
|--------|-------------|------------|
| `APP_ROLE_ARN` | IAM role ARN for deployment OIDC | Create in AWS IAM |
| `S3_BUCKET_NAME` | S3 bucket from Terraform | `terraform output s3_bucket_name` |
| `CLOUDFRONT_DISTRIBUTION_ID` | Distribution ID | `terraform output cloudfront_distribution_id` |
| `CONTACT_API_URL` | API Gateway endpoint | `terraform output contact_form_api_endpoint` |
| `DOMAIN_NAME` | Your domain | Same as above |

## Deployment Process

### First Time Setup

1. **Run Infrastructure Pipeline**
   ```
   Push infrastructure code → infrastructure-deploy runs → Infrastructure created
   ```

2. **Copy Outputs to Secrets**
   After infrastructure-deploy completes, copy these from the job summary:
   - `s3_bucket_name` → Secret: `S3_BUCKET_NAME`
   - `cloudfront_distribution_id` → Secret: `CLOUDFRONT_DISTRIBUTION_ID`
   - `contact_form_api_endpoint` → Secret: `CONTACT_API_URL`

3. **Run Service Pipeline**
   ```
   Push frontend code → service-deploy runs → Site deployed
   ```

### Ongoing Workflow

```
┌─────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│ Change Terraform│────▶│  PR → Review     │────▶│ Merge → Auto Deploy│
└─────────────────┘     └──────────────────┘     └──────────────────┘
                                │                          │
                                │                          ▼
                                │                   ┌──────────────────┐
                                │                   │  Infrastructure  │
                                │                   │     Updated      │
                                │                   └──────────────────┘
                                ▼
                       ┌──────────────────┐
                       │ Terraform Plan   │
                       │ Posted to PR     │
                       └──────────────────┘

┌─────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│ Change Frontend │────▶│  PR → Review     │────▶│ Merge → Auto Deploy│
└─────────────────┘     └──────────────────┘     └──────────────────┘
                                                          │
                                                          ▼
                                                   ┌──────────────────┐
                                                   │ Frontend Deployed│
                                                   │ to S3/CloudFront │
                                                   └──────────────────┘
```

## Manual Triggers

Both deploy workflows support manual triggering:

- **Infrastructure**: `Actions → Infrastructure Deploy → Run workflow`
- **Service**: `Actions → Service Deploy → Run workflow`

## AWS OIDC Setup

Required for both pipelines (no long-lived credentials):

### 1. Create OIDC Provider (one time)
```bash
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --thumbprint-list 6938fd4e98bab1fa863186ae26ebb0a0decd5e8d \
  --client-id-list sts.amazonaws.com
```

### 2. Create IAM Roles

**Terraform Role** (`TF_ROLE_ARN`):
- Trust: GitHub OIDC
- Permissions: `AdministratorAccess` (or scoped: S3, CloudFront, Route53, ACM, Lambda, API Gateway, IAM, WAF, DynamoDB)

**App Role** (`APP_ROLE_ARN`):
- Trust: GitHub OIDC
- Permissions: S3 Put/Delete, CloudFront CreateInvalidation

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Service deploy fails with "bucket not found" | Copy outputs from infrastructure-deploy to secrets |
| Terraform plan shows no changes | Check paths filter matches your changed files |
| OIDC authentication fails | Verify secrets names and IAM role ARNs |

## Pipeline Independence

These pipelines are **independent**:
- Infrastructure changes don't trigger service deploy
- Frontend changes don't touch infrastructure
- Each can be run manually without the other
- Service deploy uses stored secrets (not direct Terraform outputs)
