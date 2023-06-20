#!/usr/bin/env bash

set -e

docker-compose -f docker-compose.test.yml run --rm -u node backend-api npm run test