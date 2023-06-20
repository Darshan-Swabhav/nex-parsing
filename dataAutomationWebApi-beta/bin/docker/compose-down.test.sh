#!/usr/bin/env bash

set -e

echo "THIS WILL DESTROY EVERYTHING. Ctrl-C to abort or enter to continue."

docker-compose -f docker-compose.test.yml down --volumes