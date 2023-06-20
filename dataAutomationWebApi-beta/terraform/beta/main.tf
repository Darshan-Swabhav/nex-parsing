module "backend" {
  source  = "git::git@github.com:nexsalesdev/da-tf-modules.git//backend?ref=dev"

  project_id                       = data.terraform_remote_state.project.outputs.project_id
  project_number                   = data.terraform_remote_state.project.outputs.project_number
  region                           = data.terraform_remote_state.project.outputs.region
  environment                      = var.env_name
  database_name                    = data.terraform_remote_state.db.outputs.database_name
  database_url                     = data.terraform_remote_state.db.outputs.database_url
  database_user                    = data.terraform_remote_state.db.outputs.database_user
  database_password_secret_id      = data.terraform_remote_state.db.outputs.database_password_secret_id
  database_password_secret_version = data.terraform_remote_state.db.outputs.database_password_secret_version
  subdomain                        = var.subdomain
  backend_container_image          = var.backend_container_image
  backend_container_port           = var.backend_container_port
  backend_service_max_scale        = var.backend_service_max_scale
  backend_service_min_scale        = var.backend_service_min_scale
  import_file_bucket               = var.import_file_bucket
  master_import_file_bucket        = var.master_import_file_bucket        
  master_download_file_bucket      = var.master_download_file_bucket 
  master_database_url              = var.master_database_url
  inclusion_export_bucket          = var.inclusion_export_bucket 
}

module "loadbalancer" {
  source = "git::git@github.com:nexsalesdev/da-tf-modules.git//loadbalancer?ref=dev"

  project_id                  = data.terraform_remote_state.project.outputs.project_id
  region                      = data.terraform_remote_state.project.outputs.region
  environment                 = var.env_name
  dns_zone_name               = data.terraform_remote_state.dns.outputs.zone_name
  domain_name                 = data.terraform_remote_state.dns.outputs.domain_name
  subdomain                   = var.subdomain
  frontend_bucket_name        = data.terraform_remote_state.frontend.outputs.frontend_bucket
  openapi_file_path           = var.openapi_file_path
  frontend_bucket_backend_cdn = var.enable_frontend_cdn
}
