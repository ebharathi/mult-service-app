variable "project_name" {
  description = "Project name used for naming resources"
  type        = string
  default     = "project_name"
}

variable "environment" {
  description = "Environment name (e.g., dev, prod)"
  type        = string
}

variable "ami_id" {
  description = "AMI ID for the EC2 instance (e.g., Ubuntu 22.04)"
  type        = string
}

variable "ec2_instance_type" {
  description = "EC2 instance type for bastion"
  type        = string
}

variable "key_name" {
  description = "Key pair name for SSH access"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID where the EC2 will be deployed"
  type        = string
}

variable "public_subnet_id" {
  description = "Subnet ID for the EC2 instance (should be a public subnet)"
  type        = string
}

variable "common_tags" {
  description = "Common tags applied to all resources"
  type        = map(string)
  default     = {}
}


variable "iam_instance_profile" {
    description = "IAM role for ecr pull policy"
    type        = string
}
