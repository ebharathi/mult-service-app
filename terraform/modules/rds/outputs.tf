output "db_endpoint" {
  description = "Connection endpoint for the RDS instance"
  value       = module.rds.db_instance_endpoint
}

output "db_sg_id" {
  description = "ID of the security group attached to RDS"
  value       = module.rds_sg.security_group_id
}

output "db_identifier" {
  description = "Identifier of the RDS instance"
  value       = module.rds.db_instance_identifier
}
