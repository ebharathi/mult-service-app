variable "account_id" {}

variable "project_name" {
  description = "Project name used for naming resources"
  type        = string
  default     = "project_name"
}

variable "environment" {
  description = "Environment name (e.g., dev, prod)"
  type        = string
}

variable "rds_instance_class" {
  description = "Instance type for RDS"
  type        = string
  default     = "db.t4g.micro"
}

variable "db_name" {
  description = "Name of the initial database to create"
  type        = string
}

variable "db_username" {
  description = "Master username for RDS"
  type        = string
}

variable "db_password" {
  description = "Master password for RDS"
  type        = string
  sensitive   = true
}

variable "vpc_id" {
  description = "VPC ID for RDS deployment"
  type        = string
}

variable "private_subnet_ids" {
  description = "Subnet IDs for the RDS instance (should be private)"
  type        = list(string)
}

variable "ec2_sg_id" {
  description = "EC2 security group ID allowed to connect to RDS"
  type        = string
}

variable "common_tags" {
  description = "Common tags applied to all resources"
  type        = map(string)
  default     = {}
}
