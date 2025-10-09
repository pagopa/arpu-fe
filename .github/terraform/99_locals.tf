locals {
  # Common Tags:
  common_tags = {
    CreatedBy   = "Terraform"
    Environment = var.env
    Owner       = upper(var.prefix)
    Source      = "https://github.com/pagopa/arpu-fe" # Repository URL
    CostCenter  = "TS310 - PAGAMENTI & SERVIZI"
  }

  # Repo
  github = {
    org        = "pagopa"
    repository = "arpu-fe"
  }

  env_secrets   = {}
  env_variables = {}

  repo_secrets = var.env_short == "p" ? {
    SONAR_TOKEN = data.azurerm_key_vault_secret.sonar_token[0].value
    ADMIN_GITHUB_TOKEN_RW = data.azurerm_key_vault_secret.github_token[0].value
    SLACK_WEBHOOK_URL = data.azurerm_key_vault_secret.slack_webhook[0].value
    E2E_USERNAME = data.azurerm_key_vault_secret.arpu_fe_e2e_test_user[0].value
    E2E_PASSWORD = data.azurerm_key_vault_secret.arpu_fe_e2e_test_password[0].value
  } : {}

  repo_env = var.env_short == "p" ? {
    SONARCLOUD_PROJECT_NAME = "arpu-fe"
    SONARCLOUD_PROJECT_KEY  = "pagopa_arpu-fe"
    SONARCLOUD_ORG          = "pagopa"
  } : {}

  map_repo = {
    "dev" : "*",
    "uat" : "uat"
    "prod" : "main"
  }
}
