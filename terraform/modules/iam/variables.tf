variable "project_name" {
  description = "Project name used for naming resources"
  type        = string
  default     = "project_name"
}

variable "environment" {
  description = "Environment name (e.g., dev, prod)"
  type        = string
}
