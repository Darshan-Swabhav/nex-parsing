variable "env_name" {
  description = "Name of the environment"
  type        = string
  default     = "production"
}

variable "subdomain" {
  description = "Subdomain for the system"
  type        = string
  default     = "beta"
}

variable "backend_container_image" {
  description = "Container Registry URL for image"
  type        = string
}

variable "backend_container_port" {
  description = "Port on which the container will listen"
  type        = number
  default     = 20100
}

variable "openapi_file_path" {
  description = "Path of the openapi spec file"
  type        = string
}

variable "import_file_bucket" {
  description = "Bucket where files for import process are placed"
  type        = string
  default     = "beta-da-import-files"
}

variable "enable_frontend_cdn" {
  type    = bool
  default = true
}

variable "backend_service_max_scale" {
  description = "Maximum number of Cloud Run Service instances to create"
  type        = string
  default     = "12"
}

variable "backend_service_min_scale" {
  description = "Minimum number of Cloud Run Service instances to create"
  type        = string
  default     = "2"
}

variable "master_import_file_bucket" {
  description = "Name of the bucket where the import process files are stored"
  type        = string
  default     = "beta-master-import-files"
}

variable "master_download_file_bucket" {
  description = "Name of the bucket where the download/export files are stored"
  type        = string
  default     = "beta-master-download-files"
}

variable "master_database_url" {
  description = "Cloud SQL Master Database Instance URL"
  type        = string
  default     = "da-tf-project-1-1b0f:us-central1:beta-master-db-instance"
}

variable "inclusion_export_bucket" {
  description = "Name of the bucket where the Inclusion export files are stored"
  type        = string
  default     = "beta-da-inclusion-import-files"
}