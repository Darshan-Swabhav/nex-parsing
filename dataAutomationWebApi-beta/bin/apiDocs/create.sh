gcloud api-gateway api-configs create backend-api-config-$BUILD_ID \
  --api=backend-api-gw --openapi-spec=api.yaml \