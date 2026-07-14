#!/bin/bash
set -e

DOMAIN="demo5.amantech-eg.com"
EMAIL="admin@amantech-eg.com"
PORT=10011

echo "=========================================="
echo "  Deploying Aqsat Application"
echo "  Domain: $DOMAIN"
echo "  Port: $PORT"
echo "=========================================="

# Install Docker
if ! command -v docker &> /dev/null; then
    echo "[1/7] Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
else
    echo "[1/7] Docker already installed"
fi

# Install Docker Compose plugin
if ! docker compose version &> /dev/null; then
    echo "[2/7] Installing Docker Compose plugin..."
    apt-get update && apt-get install -y docker-compose-plugin
else
    echo "[2/7] Docker Compose already installed"
fi

# Stop old containers
echo "[3/7] Stopping old containers..."
docker compose down 2>/dev/null || true

# Copy initial nginx config (no SSL yet)
echo "[4/7] Setting up nginx..."
cp nginx-initial.conf nginx.conf

# Build and start app + nginx (no SSL yet)
echo "[5/7] Building and starting containers..."
docker compose up -d --build

echo "Waiting for app to start..."
sleep 15

# Get SSL certificate
echo "[6/7] Getting SSL certificate..."
docker compose run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    -d "$DOMAIN"

# Switch to SSL nginx config
echo "[7/7] Enabling SSL..."
cp nginx.conf nginx-http-only.conf
cp nginx.conf nginx.conf 2>/dev/null || true

# Restart nginx with SSL
docker compose restart nginx

echo ""
echo "=========================================="
echo "  SUCCESS! Deployment Complete!"
echo "=========================================="
echo ""
echo "  Direct IP:  http://92.5.115.174:$PORT"
echo "  Domain:     https://$DOMAIN"
echo "  API:        https://$DOMAIN/api/users"
echo ""
echo "  Login credentials:"
echo "  Admin:      admin@system.com / admin123"
echo "  Supervisor: supervisor@system.com / super123"
echo "  Collector:  collector@system.com / collect123"
echo ""
echo "  Commands:"
echo "  Logs:    docker compose logs -f"
echo "  Stop:    docker compose down"
echo "  Restart: docker compose restart"
echo "  Update:  docker compose up -d --build"
echo "=========================================="