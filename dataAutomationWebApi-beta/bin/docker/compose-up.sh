#!/usr/bin/env bash

set -e
echo "1"
docker-compose up -d postgres master-postgres
echo "2"
WAIT_FOR_PG_ISREADY="while ! pg_isready --quiet; do sleep 1; done;"
docker-compose exec postgres bash -c "$WAIT_FOR_PG_ISREADY"
echo "3"
# Gold-Mine DB
DB_INSTANCE_URL='postgres'
echo "4"
for ENV in local test
do
  DB_NAME=$ENV
  
  # Create database for this environment if it doesn't already exist.
  docker-compose exec postgres \
    su - postgres -c "psql $ENV -c '' || createdb $ENV"
echo "5"
  # Run migrations in this environment.
  # docker-compose run --rm -e NODE_ENV=$ENV -e DB_NAME=$DB_NAME backend-api cat /srv/backend-api/node_modules/@nexsalesdev/dataautomation-datamodel/lib/config/config.js
  docker-compose run --rm -e NODE_ENV=$ENV -e DB_INSTANCE_URL=$DB_INSTANCE_URL -e DB_NAME=$DB_NAME backend-api node syncModels.js
echo "6"
  # docker-compose run --rm -e NODE_ENV=$ENV -e DB_NAME=$DB_NAME backend-api npx sequelize-cli db:migrate
  
  SEEDERS_PATH=''
  if [ "$ENV" == 'local' ]
  then
    SEEDERS_PATH='node_modules/@nexsalesdev/dataautomation-datamodel/lib/db/developmentSeeders'
  elif [ "$ENV" == 'test' ]
  then
    SEEDERS_PATH='node_modules/@nexsalesdev/dataautomation-datamodel/lib/db/testSeeders'
  fi

  if [ -n "${SEEDERS_PATH}" ]; then
    docker-compose run --rm -e NODE_ENV=$ENV -e DB_INSTANCE_URL=$DB_INSTANCE_URL -e DB_NAME=$DB_NAME backend-api npx sequelize-cli db:seed:all --seeders-path $SEEDERS_PATH
echo "7"
  fi

done

# Mastre DB
ENV='local'
DB_NAME=$ENV
MASTER_DB_INSTANCE_URL='master-postgres'
CONFIG='node_modules/@nexsalesdev/master-data-model/lib/config/config.js'
echo "8"
# Create database for this environment if it doesn't already exist.
docker-compose exec master-postgres \
  su - postgres -c "psql $DB_NAME -c '' || createdb $DB_NAME"
echo "9"
docker-compose run --rm -e NODE_ENV=$ENV -e MASTER_DB_INSTANCE_URL=$MASTER_DB_INSTANCE_URL -e DB_NAME=$DB_NAME backend-api node syncMasterDBModels.js
echo "10"
# Run Seeders // TODO:: below two lines unCommit after add seeders in masterDB
MASTER_SEEDERS_PATH='node_modules/@nexsalesdev/master-data-model/lib/db/developmentSeeders'
docker-compose run --rm -e NODE_ENV=$ENV -e MASTER_DB_INSTANCE_URL=$MASTER_DB_INSTANCE_URL -e DB_NAME=$DB_NAME backend-api npx sequelize-cli db:seed:all --config $CONFIG --seeders-path $MASTER_SEEDERS_PATH
echo "11"
docker-compose up -d
echo "12"