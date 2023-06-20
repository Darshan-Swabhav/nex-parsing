data "terraform_remote_state" "project" {
  backend = "gcs"

  config = {
    bucket = "nexsales-terraform"
    prefix = "da/dev/project"
  }
}

data "terraform_remote_state" "dns" {
  backend = "gcs"

  config = {
    bucket = "nexsales-terraform"
    prefix = "da/dev/dns"
  }
}

data "terraform_remote_state" "frontend" {
  backend = "gcs"

  config = {
    bucket = "nexsales-terraform"
    prefix = "da/dev/frontend"
  }
}

data "terraform_remote_state" "db" {
  backend = "gcs"

  config = {
    bucket = "nexsales-terraform"
    prefix = "da/dev/db"
  }
}
