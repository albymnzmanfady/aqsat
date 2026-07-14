#!/bin/bash
set -e

echo "=========================================="
echo "  Deploying Aqsat Application"
echo "=========================================="

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
fi

# Check Docker Compose
if ! command -v docker compose &> /dev/null; then
    echo "Installing Docker Compose plugin..."
    apt-get update && apt-get install -y docker-compose-plugin
fi

# Stop old containers
echo "Stopping old containers..."
docker compose down 2>/dev/null || true

# Build and start
echo "Building and starting containers..."
docker compose up -d --build

# Wait for health check
echo "Waiting for app to be healthy..."
sleep 10

# Check status
if docker compose ps | grep -q "Up"; then
    echo ""
    echo "=========================================="
    echo "  SUCCESS! App is running!"
    echo "=========================================="
    echo ""
    echo "  HTTP:  http://localhost"
    echo "  API:   http://localhost/api/users"
    echo ""
    echo "  Logs:  docker compose logs -f"
    echo "  Stop:  docker compose down"
    echo "=========================================="
else
    echo ""
    echo "ERROR: Something went wrong."
    echo "Check logs: docker compose logs"
fi