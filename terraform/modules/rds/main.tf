module "rds_sg" {
  source  = "terraform-aws-modules/security-group/aws"
  version = "5.0.0"

  name        = "${var.project_name}-${var.environment}-rds-sg"
  description = "RDS security group"
  vpc_id      = var.vpc_id

  ingress_with_source_security_group_id = [
    {
      from_port                = 5432
      to_port                  = 5432
      protocol                 = "tcp"
      source_security_group_id = var.ec2_sg_id
    }
  ]

  egress_rules = ["all-all"]

  tags = merge(var.common_tags, {
    Name = "${var.project_name}-${var.environment}-rds-sg"
  })
}
resource "aws_kms_key" "rds" {
  description             = "KMS key for RDS"
  deletion_window_in_days = 7
  enable_key_rotation     = true
}


# RDS instance
module "rds" {
  source  = "terraform-aws-modules/rds/aws"
  version = "6.1.0"

  identifier = "${var.project_name}-${var.environment}-db"

  engine               = "postgres"
  family             =   "postgres16"
  engine_version       = "16.8"
  instance_class       = var.rds_instance_class
  allocated_storage    = 20

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password
  manage_master_user_password = false
  multi_az               = false
  publicly_accessible    = false
  vpc_security_group_ids = [module.rds_sg.security_group_id]
  subnet_ids             = var.private_subnet_ids
  create_db_subnet_group = true
  db_subnet_group_name   = "project_name-${var.environment}-db-subnet-group"
  skip_final_snapshot = true
  apply_immediately = true
  kms_key_id = aws_kms_key.rds.arn

  tags = merge(var.common_tags, {
    Role = "database"
  })
}
