#!/bin/bash

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

DOMAIN="demo5.amantech-eg.com"
EMAIL="admin@amantech-eg.com"
IP_PORT="10011"

echo -e "${CYAN}╔══════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   🚀 نشر نظام الأقساط على VPS      ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════╝${NC}"
echo ""

# Step 1: Check Docker
echo -e "${YELLOW}📦 [1/6] التحقق من Docker...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}   جاري تثبيت Docker...${NC}"
    curl -fsSL https://get.docker.com | sh
    echo -e "${GREEN}   ✅ تم تثبيت Docker${NC}"
else
    echo -e "${GREEN}   ✅ Docker مثبت${NC}"
fi

if ! command -v docker compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${YELLOW}   جاري تثبيت Docker Compose plugin...${NC}"
    apt-get update && apt-get install -y docker-compose-plugin
fi
echo -e "${GREEN}   ✅ Docker Comote جاهز${NC}"
echo ""

# Step 2: Install Certbot for SSL
echo -e "${YELLOW}🔒 [2/6] تثبيت Certbot للشهادات SSL...${NC}"
if ! command -v certbot &> /dev/null; then
    apt-get update && apt-get install -y certbot
fi
echo -e "${GREEN}   ✅ Certbot جاهز${NC}"
echo ""

# Step 3: Get SSL Certificate
echo -e "${YELLOW}📜 [3/6] الحصول على شهادة SSL...${NC}"
mkdir -p /var/www/certbot
mkdir -p ./nginx-certs

# Check if cert already exists
if [ ! -f "./nginx-certs/fullchain.pem" ]; then
    echo -e "${YELLOW}   جاري الحصول على شهادة Let's Encrypt...${NC}"
    
    # Start nginx temporarily with HTTP only for cert verification
    cat > /tmp/nginx-temp.conf << 'TEMPCONF'
server {
    listen 80;
    server_name demo5.amantech-eg.com;
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    location / {
        return 200 'ok';
    }
}
TEMPCONF

    # Run certbot with webroot
    certbot certonly --webroot \
        -w /var/www/certbot \
        -d "$DOMAIN" \
        --email "$EMAIL" \
        --agree-tos \
        --non-interactive || {
        echo -e "${YELLOW}   ⚠️  فشل الحصول على الشهادة. سيتم استخدام HTTP فقط مؤقتاً${NC}"
        echo -e "${YELLOW}   يمكنك لاحقاً تشغيل: certbot certonly --standalone -d $DOMAIN${NC}"
    }

    # Copy certs to nginx volume
    if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
        cp "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ./nginx-certs/
        cp "/etc/letsencrypt/live/$DOMAIN/privkey.pem" ./nginx-certs/
        echo -e "${GREEN}   ✅ تم الحصول على شهادة SSL${NC}"
    else
        echo -e "${YELLOW}   ⚠️  لن يتم استخدام SSL مؤقتاً${NC}"
    fi
else
    echo -e "${GREEN}   ✅ شهادة SSL موجودة${NC}"
fi
echo ""

# Step 4: Build and deploy
echo -e "${YELLOW}🔨 [4/6] بناء التطبيق...${NC}"
docker compose down 2>/dev/null || true
docker image prune -f 2>/dev/null || true
docker compose build --no-cache
echo -e "${GREEN}   ✅ تم البناء بنجاح${NC}"
echo ""

# Step 5: Start services
echo -e "${YELLOW}▶️  [5/6] تشغيل الخدمات...${NC}"
docker compose up -d
echo ""

# Step 6: Verify
echo -e "${YELLOW}🔍 [6/6] التحقق من التشغيل...${NC}"
sleep 10

if docker compose ps | grep -q "Up"; then
    SERVER_IP=$(hostname -I | awk '{print $1}')
    echo ""
    echo -e "${CYAN}╔══════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║     ✅ تم النشر بنجاح!              ║${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${GREEN}📍 الروابط:${NC}"
    echo -e "   🌐 IP直达:    ${CYAN}http://${SERVER_IP}:${IP_PORT}${NC}"
    echo -e "   🔒 Domain:     ${CYAN}https://${DOMAIN}${NC}"
    echo ""
    echo -e "${GREEN}📋 أوامر مفيدة:${NC}"
    echo "   docker compose logs -f           # عرض السجلات"
    echo "   docker compose restart           # إعادة التشغيل"
    echo "   docker compose down              # إيقاف"
    echo "   docker compose up -d --build     # إعادة البناء والتشغيل"
    echo ""
    echo -e "${YELLOW}⚠️  لتجديد شهادة SSL تلقائياً أضف:${NC}"
    echo "   0 0 1 * * certbot renew --webroot -w /var/www/certbot && docker compose restart nginx" | crontab -
    echo ""
else
    echo -e "${RED}❌ فشل التشغيل. السجلات:${NC}"
    docker compose logs --tail=50
fi