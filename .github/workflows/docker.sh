#!/usr/bin/env bash

set -euo pipefail

docker build --no-cache -t alasdiablodocker/tdm-factory:"$1" .

docker push alasdiablodocker/tdm-factory:"$1"

