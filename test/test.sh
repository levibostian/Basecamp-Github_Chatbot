#!/bin/sh

# Exit on any error
set -e

curl -sS -X POST http://localhost:3000/hook

exit $?