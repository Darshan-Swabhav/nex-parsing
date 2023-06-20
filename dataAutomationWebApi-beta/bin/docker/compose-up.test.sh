#!/usr/bin/env bash

set -e

ENV='test'
DB_NAME=$ENV
DB_INSTANCE_URL='postgres'

docker-compose -f docker-compose.test.yml up -d postgres

WAIT_FOR_PG_ISREADY="while ! pg_isready --quiet; do sleep 3; echo waiting for Postgres To Accept Connection... ; done;"
docker-compose -f docker-compose.test.yml exec -T postgres bash -c "$WAIT_FOR_PG_ISREADY"

# Create database for this environment if it doesn't already exist.
docker-compose -f docker-compose.test.yml exec -T postgres \
  su - postgres -c "psql $ENV -c '' || createdb $ENV"

# Run migrations in this environment.
#docker-compose -f docker-compose.test.yml run --rm -e NODE_ENV=$ENV backend-api cat /srv/backend-api/node_modules/@nexsalesdev/dataautomation-datamodel/lib/config/config.js
docker-compose -f docker-compose.test.yml run --rm -e NODE_ENV=$ENV -e DB_INSTANCE_URL=$DB_INSTANCE_URL -e DB_NAME=$DB_NAME backend-api node syncModels.js
# docker-compose -f docker-compose.test.yml run --rm -e NODE_ENV=$ENV backend-api npx sequelize-cli db:migrate

SEEDERSPATH='node_modules/@nexsalesdev/dataautomation-datamodel/lib/db/testSeeders'

docker-compose -f docker-compose.test.yml run --rm -e NODE_ENV=$ENV -e DB_INSTANCE_URL=$DB_INSTANCE_URL -e DB_NAME=$DB_NAME backend-api npx sequelize-cli db:seed:all --seeders-path $SEEDERSPATH

docker-compose -f docker-compose.test.yml up -d backend-api