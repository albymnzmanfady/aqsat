#!/bin/bash

set -e

echo "🚀 Starting deployment..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Installing...${NC}"
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    echo -e "${GREEN}✅ Docker installed successfully${NC}"
fi

# Check if Docker Compose is available
if ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not available${NC}"
    exit 1
fi

# Stop existing containers
echo -e "${YELLOW}⏹️  Stopping existing containers...${NC}"
docker compose down 2>/dev/null || true

# Remove old images to free space
echo -e "${YELLOW}🧹 Cleaning up old images...${NC}"
docker image prune -f 2>/dev/null || true

# Build and start
echo -e "${YELLOW}🔨 Building application...${NC}"
docker compose build --no-cache

echo -e "${YELLOW}▶️  Starting application...${NC}"
docker compose up -d

# Wait for health check
echo -e "${YELLOW}⏳ Waiting for application to start...${NC}"
sleep 10

# Check if running
if docker compose ps | grep -q "Up"; then
    echo -e "${GREEN}✅ Application is running successfully!${NC}"
    echo ""
    echo -e "${GREEN}📍 URL: http://$(hostname -I | awk '{print $1}'):3001${NC}"
    echo ""
    echo -e "${YELLOW}📋 Useful commands:${NC}"
    echo "  docker compose logs -f        # View logs"
    echo "  docker compose restart        # Restart"
    echo "  docker compose down           # Stop"
    echo "  docker compose up -d --build  # Rebuild & start"
else
    echo -e "${RED}❌ Application failed to start. Checking logs...${NC}"
    docker compose logs --tail=50
fi