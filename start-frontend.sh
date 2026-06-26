#!/bin/bash
set -e

cd frontend

# Load env vars
if [ -f .env ]; then
  set -a
  source .env
  set +a
fi

# Export static build
echo "Building Expo web static export..."
NODE_PATH=../node_modules ../node_modules/.bin/expo export --platform web --output-dir dist

# Serve the static build on port 5000
echo "Serving on port 5000..."
exec ../node_modules/.bin/serve dist --listen 5000 --no-port-switching --single
