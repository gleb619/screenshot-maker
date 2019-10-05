#!/usr/bin/env bash

docker rmi -f test-image || true
docker build -t test-image .
docker run --name test --rm -p 9000:9000 test-image
#curl -v http://localhost:9000