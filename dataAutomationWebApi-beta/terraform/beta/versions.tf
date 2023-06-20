terraform {
  required_version = ">=0.15"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "3.69.0"
    }

    google-beta = {
      source  = "hashicorp/google-beta"
      version = "3.69.0"
    }
  }

  backend "gcs" {
    bucket = "nexsales-terraform"
    prefix = "da/beta/backend"
  }

}

provider "google" {}

provider "google-beta" {}
