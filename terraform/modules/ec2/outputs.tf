output "ec2_public_ip" {
  value = module.ec2.public_ip
}

output "ec2_sg_id" {
  value = module.ec2_sg.security_group_id
}

output "elastic_ip" {
  description = "Elastic IP assigned to EC2"
  value       = aws_eip.ec2_eip.public_ip
}
