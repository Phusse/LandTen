#!/usr/bin/env bash
# =============================================================
# LandTen — Developer Setup Script
# Run this once after cloning the repo:  bash setup.sh
# =============================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║       LandTen — Developer Setup          ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════╝${NC}"
echo ""

# -----------------------------------------------------------
# 1. Install Git hooks
# -----------------------------------------------------------
echo -e "⚙️  Installing Git hooks..."

git config core.hooksPath .githooks
chmod +x .githooks/pre-commit

echo -e "${GREEN}✅ Git hooks installed (secret scanner active on every commit).${NC}"

# -----------------------------------------------------------
# 2. Check for .env file
# -----------------------------------------------------------
echo ""
echo -e "⚙️  Checking environment files..."

if [ ! -f ".env" ]; then
  echo -e "${YELLOW}⚠️  No .env file found at the root.${NC}"
  echo -e "   Copy the example and fill in your credentials:"
  echo -e "   ${CYAN}cp LandlordTenantPlatform/.env.example .env${NC}"
else
  echo -e "${GREEN}✅ .env file found.${NC}"
fi

if [ ! -f "LandlordTenantUI/.env" ]; then
  echo -e "${YELLOW}⚠️  No .env file found in LandlordTenantUI/.${NC}"
  echo -e "   Copy the example and fill in your credentials:"
  echo -e "   ${CYAN}cp LandlordTenantUI/.env.example LandlordTenantUI/.env${NC}"
else
  echo -e "${GREEN}✅ LandlordTenantUI/.env file found.${NC}"
fi

# -----------------------------------------------------------
# 3. Check required tools
# -----------------------------------------------------------
echo ""
echo -e "⚙️  Checking required tools..."

check_tool() {
  if command -v "$1" &> /dev/null; then
    echo -e "${GREEN}✅ $1 is installed.${NC}"
  else
    echo -e "${RED}❌ $1 is NOT installed. Please install it before continuing.${NC}"
  fi
}

check_tool dotnet
check_tool node
check_tool npm
check_tool docker

# -----------------------------------------------------------
# 4. Install frontend dependencies
# -----------------------------------------------------------
echo ""
echo -e "⚙️  Installing frontend dependencies..."

if [ -d "LandlordTenantUI/node_modules" ]; then
  echo -e "${GREEN}✅ node_modules already present, skipping npm install.${NC}"
else
  (cd LandlordTenantUI && npm install)
  echo -e "${GREEN}✅ Frontend dependencies installed.${NC}"
fi

# -----------------------------------------------------------
# 5. Done
# -----------------------------------------------------------
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║         ✅ Setup complete!               ║${NC}"
echo -e "${GREEN}╠══════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║  Start backend:                          ║${NC}"
echo -e "${GREEN}║    cd LandlordTenantPlatform             ║${NC}"
echo -e "${GREEN}║    bash start_services.sh                ║${NC}"
echo -e "${GREEN}║                                          ║${NC}"
echo -e "${GREEN}║  Start frontend:                         ║${NC}"
echo -e "${GREEN}║    cd LandlordTenantUI && npm run dev    ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════╝${NC}"
echo ""
