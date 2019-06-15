#!/bin/sh

# Exit on any error
set -e

curl -sS -X POST http://basecamp-github-chatbot:3000/hook

exit $?