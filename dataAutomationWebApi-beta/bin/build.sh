#!/bin/bash
docker build --rm -f "Dockerfile" -t gcr.io/$PROJECT_ID/backend-api:$NODE_ENV "."