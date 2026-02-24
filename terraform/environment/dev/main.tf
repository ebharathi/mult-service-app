terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  backend "s3" {
    bucket = "project_name-tf-state-bucket"
    key    = "dev/terraform.tfstate"
    region = "us-east-1"
    profile  = ""  # aws cli profile name
  }
}

provider "aws" {
  region = "us-east-1"

  profile = "project_name"

  assume_role {
    role_arn     = "arn:aws:iam::${var.account_id}:role/TerraformDevExecutionRole"
    session_name = "terraform"
  }
}

locals {
  environment = "dev"
  common_tags = {
    Environment = local.environment
    Project     = "project_name"  
  }
}

# ========== VPC ==========

module "vpc" {
  source = "../../modules/vpc"

  environment            = local.environment
  vpc_cidr               = "10.1.0.0/16"
  availability_zones     = ["us-east-1a", "us-east-1b"]
  private_subnet_cidrs   = ["10.1.1.0/24", "10.1.2.0/24"]
  public_subnet_cidrs    = ["10.1.101.0/24", "10.1.102.0/24"]
  common_tags            = local.common_tags
}

# ========== IAM ==========
module "ec2_role" {
  source       = "../../modules/iam"
  project_name = "project_name"
  environment  = local.environment
}

# ========== EC2 ==========

module "ec2" {
  source = "../../modules/ec2"

  environment     = local.environment
  vpc_id      = module.vpc.vpc_id
  ami_id      = "ami-04b70fa74e45c3917" #Ubuntu
  ec2_instance_type = "t3.micro"
  key_name          = var.ssh_key_name

  public_subnet_id = module.vpc.public_subnets[0]

  iam_instance_profile = module.ec2_role.instance_profile_name

  common_tags           = local.common_tags
}

# ========== RDS ==========

module "rds" {
   source = "../../modules/rds"
   account_id              = var.account_id
   environment             = local.environment
   vpc_id                  = module.vpc.vpc_id
   ec2_sg_id               = module.ec2.ec2_sg_id
   rds_instance_class      = "db.t4g.micro"
   db_name                 = "project_namedb"
   db_username             = var.rds_db_username
   db_password             = var.rds_db_password
   private_subnet_ids      = module.vpc.private_subnets
}

# ========== VARIABLES ==========

variable "account_id" {}
variable "ssh_key_name" {}
variable "rds_db_username" {}
variable "rds_db_password" {}

#============= OUTPUTS ============

output "db_endpoint" {
  description = "Connection endpoint for the RDS instance"
  value       = module.rds.db_endpoint
}
