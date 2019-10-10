#!/bin/bash

# Retry interval in seconds
TIMEOUT=1

docker build -t basecamp-github-chatbot:test -f docker/Dockerfile-app.hub .
docker run -d -p ${SERVER_PORT}:${SERVER_PORT} --name chatbot-test --env-file=.env.test basecamp-github-chatbot:test
sleep 5
docker ps
docker logs chatbot-test

for RETRIES in {10..0}; do
    echo "Waiting for response from server... $RETRIES"
    sleep $TIMEOUT

    curl -sS -X POST http://localhost:${SERVER_PORT}/hook

    if [[ "$?" = "0" ]]; then
        echo "Server responded!"
        exit 0
    fi
done

echo "Failed to contact server."
exit 1
