# Terraform - Outreach Infrastructure

## Architecture
- **VPC**: 10.1.0.0/16, 2 AZs (us-east-1a, us-east-1b), 2 public + 2 private subnets
- **EC2**: t3.micro, Ubuntu 22.04, public subnet, Elastic IP, 26GB gp3
- **RDS**: db.t4g.micro, PostgreSQL 16.8, private subnets, encrypted, 20GB
- **IAM**: EC2 role with ECR read + SSM policies

## Prerequisites
1. AWS CLI configured with profile `outreach`
2. S3 bucket `outreach-tf-state-bucket` created manually in us-east-1
3. IAM role `TerraformDevExecutionRole` in your account
4. SSH key pair created in AWS

## Setup
```bash
# 1. Copy secrets template and fill in values
cp terraform/environment/dev/secrets.tfvars.example terraform/environment/dev/secrets.tfvars
# Edit secrets.tfvars with your account_id, ssh_key_name, rds credentials

# 2. Initialize terraform
cd terraform/environment/dev
terraform init

# 3. Plan and review
terraform plan -var-file=secrets.tfvars

# 4. Apply
terraform apply -var-file=secrets.tfvars

# 5. Get RDS endpoint
terraform output db_endpoint
```

## Destroy
```bash
cd terraform/environment/dev
terraform destroy -var-file=secrets.tfvars
```

## Generate IAM Policy
```bash
./scripts/generate-tf-policy.sh outreach outreach-tf-state-bucket
```

## Files
- `environment/dev/main.tf` — Root config (backend, provider, modules, vars, outputs)
- `environment/dev/secrets.tfvars` — Sensitive variables (gitignored)
- `modules/vpc/` — VPC with public/private subnets
- `modules/ec2/` — EC2 instance with security group and Elastic IP
- `modules/rds/` — RDS PostgreSQL with KMS encryption
- `modules/iam/` — IAM role and instance profile for EC2
