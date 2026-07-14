#!/bin/bash

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}╔════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   📦 إنشاء حزمة النشر              ║${NC}"
echo -e"${CYAN}╚════════════════════════════════════════╝${NC}"
echo ""

ARCHIVE_NAME="aqsat-deploy-$(date +%Y%m%d-%H%M%S).tar.gz"

echo -e "${YELLOW}🔨 جاري إنشاء الحزمة...${NC}"

# Create a temporary directory for the package
TEMP_DIR=$(mktemp -d)
DEPLOY_DIR="$TEMP_DIR/aqsat"

mkdir -p "$DEPLOY_DIR"

# Copy all needed files
echo -e "${CYAN}   📁 نسخ الملفات...${NC}"

# Root config files
cp package.json "$DEPLOY_DIR/"
cp package-lock.json "$DEPLOY_DIR/" 2>/dev/null || true
cp Dockerfile "$DEPLOY_DIR/"
cp docker-compose.yml "$DEPLOY_DIR/"
cp nginx.conf "$DEPLOY_DIR/"
cp deploy.sh "$DEPLOY_DIR/"
cp .dockerignore "$DEPLOY_DIR/"
cp index.html "$DEPLOY_DIR/"
cp vite.config.ts "$DEPLOY_DIR/"
cp tailwind.config.ts "$DEPLOY_DIR/"
cp postcss.config.js "$DEPLOY_DIR/"
cp tsconfig.json "$DEPLOY_DIR/"
cp tsconfig.app.json "$DEPLOY_DIR/" 2>/dev/null || true
cp tsconfig.node.json "$DEPLOY_DIR/" 2>/dev/null || true
cp components.json "$DEPLOY_DIR/" 2>/dev/null || true

# Source code
cp -r src "$DEPLOY_DIR/"

# Server code
cp -r server "$DEPLOY_DIR/"

# Public assets
cp -r public "$DEPLOY_DIR/" 2>/dev/null || true

# Make deploy.sh executable
chmod +x "$DEPLOY_DIR/deploy.sh"

# Create the archive
cd "$TEMP_DIR"
tar -czf "$(pwd)/../$ARCHIVE_NAME" aqsat/

# Cleanup
rm -rf "$TEMP_DIR"

# Get file size
SIZE=$(du -h "../$ARCHIVE_NAME" | cut -f1)

echo ""
echo -e "${GREEN}✅ تم إنشاء الحزمة بنجاح!${NC}"
echo ""
echo -e "${CYAN}📦 الحزمة:${NC} $ARCHIVE_NAME ($SIZE)"
echo -e "${CYAN}📁 الموقع:${NC} $(pwd)/$ARCHIVE_NAME"
echo ""
echo -e "${YELLOW}📋 خطوات الرفع على VPS:${NC}"
echo ""
echo "   # 1. ارفع الحزمة"
echo "   scp $ARCHIVE_NAME root@92.5.115.174:/root/"
echo ""
echo "   # 2. دخل على VPS"
echo "   ssh root@92.5.115.174"
echo ""
echo "   # 3. فك الحزمة"
echo "   tar -xzf aqsat-deploy-*.tar.gz"
echo "   cd aqsat"
echo ""
echo "   # 4. شغّل"
echo "   ./deploy.sh"