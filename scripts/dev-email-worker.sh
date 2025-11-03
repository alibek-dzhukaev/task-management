#!/bin/bash

ulimit -n 10240

echo "Starting Email Worker..."
npx nx run email-worker:serve

