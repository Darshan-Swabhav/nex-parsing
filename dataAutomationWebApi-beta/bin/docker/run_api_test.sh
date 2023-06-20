#!/usr/bin/env bash

set -e

ENV='test'
DB_NAME=$ENV
DB_INSTANCE_URL='postgres'

docker-compose -f docker-compose.test.yml run --rm -e NODE_ENV=$ENV -e DB_INSTANCE_URL=$DB_INSTANCE_URL -e DB_NAME=$DB_NAME -u node backend-api npm run api-test