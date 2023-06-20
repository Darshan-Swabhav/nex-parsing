output "app_url" {
  value = "https://${module.loadbalancer.dns_name}"
}

output "file_bucket" {
  value = module.backend.files_bucket_name
}

output "apigateway_url" {
  value = module.loadbalancer.apigateway_url
}

output "cloud_run_service_url" {
  value = module.backend.cloud_run_service_url
}
