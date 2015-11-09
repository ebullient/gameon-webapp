#!/bin/bash

#
# This script is only intended to run in the IBM DevOps Services Pipeline Environment.
#
set +x

echo Informing slack...
curl -X 'POST' --silent --data-binary '{"text":"A new build for the web application has started."}' $WEBHOOK > /dev/null
mkdir dockercfg ; cd dockercfg
echo Downloading Docker requirements..
wget http://$BUILD_DOCKER_HOST:8081/dockerneeds.tar
echo Setting up Docker...
tar xzf dockerneeds.tar ; mv docker ../ ; cd .. ; chmod +x docker ; \
	export DOCKER_HOST="tcp://$BUILD_DOCKER_HOST:2375" DOCKER_TLS_VERIFY=1 DOCKER_CONFIG=./dockercfg

echo Building the docker image...
./docker build -t gameon-webapp .
echo Stopping the existing container...
./docker stop -t 0 gameon-webapp || true
./docker rm gameon-webapp || true
echo Starting the new container...
./docker run -d -p 3000:3000 --name=gameon-webapp gameon-webapp