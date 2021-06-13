#!/bin/bash

docker build . -t tanyudii/vodeamail-api-gateway:latest
docker push tanyudii/vodeamail-api-gateway:latest