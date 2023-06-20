#!/bin/bash

set -e

# This migrations script is Cloud/Production specific

# Check for required environment variables
MISSING_VARS=""

if [ -z "${DB_USER}" ]; then
  MISSING_VARS="${MISSING_VARS} DB_USER "
elif [ -z "${DB_NAME}" ]; then
  MISSING_VARS="${MISSING_VARS} DB_NAME "
elif [ -z "${DB_INSTANCE_URL}" ]; then
  MISSING_VARS="${MISSING_VARS} DB_INSTANCE_URL "
elif [ -z "${MASTER_DB_INSTANCE_URL}" ]; then
  MISSING_VARS="${MISSING_VARS} MASTER_DB_INSTANCE_URL "
elif [ -z "${DATABASE_PASSWORD}" ]; then
  MISSING_VARS="${MISSING_VARS} DATABASE_PASSWORD "
elif [ -z "${NODE_ENV}" ]; then
  MISSING_VARS="${MISSING_VARS} NODE_ENV "
fi

if [ -z "$MISSING_VARS" ]; then
  echo "Environment variables fetched successfully"
else
  echo "$MISSING_VARS variables are missing in environment"
  exit 1
fi

SCRIPT=$(readlink -f "$0")
SCRIPT_PATH=$(dirname "$SCRIPT")

# Sync Data Base Schema
SYNC_MODELS=${SCRIPT_PATH}/../syncModels.js
SYNC_MASTER_MODELS=${SCRIPT_PATH}/../syncMasterDBModels.js
node $SYNC_MODELS
node $SYNC_MASTER_MODELS

# Drop Data Base Schema
# DROP_MODELS=${SCRIPT_PATH}/../dropModels.js
# DROP_MASTER_DB_MODELS=${SCRIPT_PATH}/../dropMasterDBModels.js
# node $DROP_MODELS
# node $DROP_MASTER_DB_MODELS

# Run Gold-Mine & Master DB Migration
MIGRATIONS_PATH=""
MASTER_DB_MIGRATIONS_PATH=""
MASTER_CONFIG='node_modules/@nexsalesdev/master-data-model/lib/config/config.js'
# MASTER_SEEDERS_PATH='node_modules/@nexsalesdev/master-data-model/lib/db/developmentSeeders'

if [ $NODE_ENV == "development" ]; then
  MIGRATIONS_PATH='node_modules/@nexsalesdev/dataautomation-datamodel/lib/db/devMigrations'
  MASTER_DB_MIGRATIONS_PATH='node_modules/@nexsalesdev/master-data-model/lib/db/devMigrations'
elif [ $NODE_ENV == "beta" ]; then
  MIGRATIONS_PATH='node_modules/@nexsalesdev/dataautomation-datamodel/lib/db/betaMigrations'
  MASTER_DB_MIGRATIONS_PATH='node_modules/@nexsalesdev/master-data-model/lib/db/betaMigrations'
elif [ $NODE_ENV == "production" ]; then
  MIGRATIONS_PATH='node_modules/@nexsalesdev/dataautomation-datamodel/lib/db/betaMigrations'
  MASTER_DB_MIGRATIONS_PATH='node_modules/@nexsalesdev/master-data-model/lib/db/betaMigrations'
fi

if [ -n "$MIGRATIONS_PATH" ]; then
    echo "Migration Path Selected: ${MIGRATIONS_PATH}"
else
    echo "Could Not Get Migration Path For Node Env : ${NODE_ENV}, Reloved Migration Path is : ${MIGRATIONS_PATH}"
    exit 1
fi

if [ -n "$MASTER_DB_MIGRATIONS_PATH" ]; then
    echo "Migration Path Selected: ${MASTER_DB_MIGRATIONS_PATH}"
else
    echo "Could Not Get Migration Path For Node Env : ${NODE_ENV}, Reloved Migration Path is : ${MASTER_DB_MIGRATIONS_PATH}"
    exit 1
fi

echo "Migrations Started"
# Gold Mine Migrations
npx sequelize-cli db:migrate --migrations-path $MIGRATIONS_PATH

# Master Migrations
MASTER_DB_INSTANCE_URL=$MASTER_DB_INSTANCE_URL npx sequelize-cli db:migrate --config $MASTER_CONFIG --migrations-path $MASTER_DB_MIGRATIONS_PATH

# Run Seeding
# npx sequelize-cli db:seed:all

# Run Seeding For Dev Environment
# if [ $NODE_ENV == "development" ]; then
#   MASTER_DB_INSTANCE_URL=$MASTER_DB_INSTANCE_URL npx sequelize-cli db:seed:all --config $MASTER_CONFIG --seeders-path $MASTER_SEEDERS_PATH
# else
#   echo "Did Not Run Seeders For Node Env : ${NODE_ENV}"
# fi

echo "Migrations Completed Successfully"

npm start