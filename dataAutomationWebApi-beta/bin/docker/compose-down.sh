#!/usr/bin/env bash

set -e

read -p "THIS WILL DESTROY EVERYTHING. Ctrl-C to abort or enter to continue."

docker-compose down --volumes