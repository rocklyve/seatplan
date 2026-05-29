#!/bin/bash
set -e

cd "$(dirname "$0")"

echo "Installing dependencies..."
npm install

echo "Building frontend..."
npm run build

echo "Restarting service..."
systemctl restart seatplan

echo "Done. Status:"
systemctl status seatplan --no-pager
