module "ec2_sg" {
  source  = "terraform-aws-modules/security-group/aws"
  version = "5.0.0"

  name        = "${var.project_name}-${var.environment}-ec2-sg"
  description = "EC2 security group"
  vpc_id      = var.vpc_id

  ingress_with_cidr_blocks       = [
       {
        from_port   = 80
        to_port     = 80
        protocol    = "tcp"
        description = "HTTP"
        cidr_blocks = "0.0.0.0/0"
      },
      {
        from_port   = 443
        to_port     = 443
        protocol    = "tcp"
        description = "HTTPS"
        cidr_blocks = "0.0.0.0/0"
      },
  ]
  egress_rules        = ["all-all"]
}

module "ec2" {
  source  = "terraform-aws-modules/ec2-instance/aws"
  version = "5.5.0"

  name          = "${var.project_name}-${var.environment}-ec2"
  ami           = var.ami_id
  instance_type = var.ec2_instance_type
  key_name      = var.key_name

  subnet_id              = var.public_subnet_id
  vpc_security_group_ids = [module.ec2_sg.security_group_id]

  root_block_device = [{
    volume_size = 26
    volume_type = "gp3"
    encrypted   = true
  }]


  associate_public_ip_address = true
  iam_instance_profile = var.iam_instance_profile

  tags = merge(var.common_tags, {
    Role = "application-server"
  })
}

resource "aws_eip" "ec2_eip" {
  instance = module.ec2.id
  domain   = "vpc"

  tags = merge(var.common_tags, {
    Name = "${var.project_name}-${var.environment}-eip"
  })
}
