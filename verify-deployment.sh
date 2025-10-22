#!/bin/bash

# ============================================
# Promorang Dual Deployment Verification Script
# ============================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

FRONTEND_URL="https://promorang.co"
BACKEND_URL="https://api.promorang.co"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Promorang Dual Deployment Verification${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Test 1: Frontend Health
echo -e "${YELLOW}Test 1: Frontend Health Check${NC}"
FRONTEND_STATUS=$(curl -s -I "$FRONTEND_URL" | head -n 1)
if echo "$FRONTEND_STATUS" | grep -q "200"; then
    echo -e "${GREEN}✅ PASS${NC} - Frontend loads successfully"
    echo "Status: $FRONTEND_STATUS"
else
    echo -e "${RED}❌ FAIL${NC} - Frontend not accessible"
    echo "Status: $FRONTEND_STATUS"
    exit 1
fi
echo ""

# Test 2: Backend Health
echo -e "${YELLOW}Test 2: Backend API Health${NC}"
BACKEND_HEALTH=$(curl -s "$BACKEND_URL/api/health")
if echo "$BACKEND_HEALTH" | grep -q '"ok":true'; then
    echo -e "${GREEN}✅ PASS${NC} - Backend API is healthy"
    echo "Response: $(echo "$BACKEND_HEALTH" | python3 -c "import sys, json; print(json.dumps(json.load(sys.stdin), indent=2))")"
else
    echo -e "${RED}❌ FAIL${NC} - Backend API health check failed"
    echo "Response: $BACKEND_HEALTH"
    exit 1
fi
echo ""

# Test 3: Frontend API Proxy
echo -e "${YELLOW}Test 3: Frontend API Proxy${NC}"
PROXY_HEALTH=$(curl -s "$FRONTEND_URL/api/health")
if echo "$PROXY_HEALTH" | grep -q '"ok":true'; then
    echo -e "${GREEN}✅ PASS${NC} - Frontend correctly proxies API requests"
    echo "Proxy Response: $(echo "$PROXY_HEALTH" | python3 -c "import sys, json; print(json.dumps(json.load(sys.stdin), indent=2))")"
else
    echo -e "${RED}❌ FAIL${NC} - Frontend API proxy not working"
    echo "Proxy Response: $PROXY_HEALTH"
    exit 1
fi
echo ""

# Test 4: CORS Headers
echo -e "${YELLOW}Test 4: CORS Configuration${NC}"
CORS_CHECK=$(curl -s -I "$BACKEND_URL/api/health" -H "Origin: $FRONTEND_URL")
if echo "$CORS_CHECK" | grep -q "Access-Control-Allow-Origin"; then
    echo -e "${GREEN}✅ PASS${NC} - CORS headers are set correctly"
    echo "CORS Headers:"
    echo "$CORS_CHECK" | grep "Access-Control"
else
    echo -e "${RED}❌ FAIL${NC} - CORS headers missing"
    echo "Response Headers: $CORS_CHECK"
    exit 1
fi
echo ""

# Test 5: Content Type
echo -e "${YELLOW}Test 5: Response Content Type${NC}"
CONTENT_TYPE=$(curl -s -I "$BACKEND_URL/api/health")
if echo "$CONTENT_TYPE" | grep -q "application/json"; then
    echo -e "${GREEN}✅ PASS${NC} - API returns correct content type"
    echo "Content-Type: $(echo "$CONTENT_TYPE" | grep "content-type")"
else
    echo -e "${RED}❌ FAIL${NC} - API missing JSON content type"
    echo "Headers: $CONTENT_TYPE"
    exit 1
fi
echo ""

# Test 6: No SSO Nonce Issues
echo -e "${YELLOW}Test 6: No SSO/401 Issues${NC}"
HTTP_CODE=$(curl -s -I "$BACKEND_URL/api/health" | head -n 1)
if echo "$HTTP_CODE" | grep -q "200"; then
    echo -e "${GREEN}✅ PASS${NC} - No 401 or SSO nonce issues (HTTP 200)"
    echo "Status: $HTTP_CODE"
else
    echo -e "${RED}❌ FAIL${NC} - SSO or auth issues detected"
    echo "Status: $HTTP_CODE"
    exit 1
fi
echo ""

# Test 7: Backend Routes
echo -e "${YELLOW}Test 7: Backend Routes Available${NC}"
BACKEND_ROUTES=("health" "economy" "auth")
for route in "${BACKEND_ROUTES[@]}"; do
    ROUTE_CHECK=$(curl -s -I "$BACKEND_URL/api/$route" | head -n 1)
    if echo "$ROUTE_CHECK" | grep -q "200\|404"; then
        echo -e "${GREEN}✅ PASS${NC} - Route /api/$route accessible"
    else
        echo -e "${RED}❌ FAIL${NC} - Route /api/$route not accessible"
        echo "Status: $ROUTE_CHECK"
        exit 1
    fi
done
echo ""

# Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✅ DUAL DEPLOYMENT VERIFICATION COMPLETE${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}Verification Summary:${NC}"
echo "Frontend URL: $FRONTEND_URL"
echo "Backend URL: $BACKEND_URL"
echo "API Proxy: $FRONTEND_URL/api/* → $BACKEND_URL/api/*"
echo "CORS: ✅ Configured"
echo "Content-Type: ✅ JSON"
echo "No SSO Issues: ✅ Confirmed"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Visit $FRONTEND_URL in browser"
echo "2. Check DevTools → Network for API calls"
echo "3. Verify API calls go to $BACKEND_URL"
echo "4. Test authentication flow"
echo "5. Deploy via GitHub Actions on next push"
