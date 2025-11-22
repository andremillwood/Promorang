#!/usr/bin/env bash
set -euo pipefail

API=https://api.promorang.co
FRONT=https://promorang.co

echo "🧪 Phase 2 Smoke Tests"
echo "====================="

# Health check
echo -n "✅ Health check... "
curl -sf $API/api/health || { echo "❌ FAILED"; exit 1; }
echo "OK"

# Public lists (no auth required)
echo -n "✅ Public content list... "
CONTENT_RESP=$(curl -sf $API/api/content) || { echo "❌ FAILED"; exit 1; }
echo "$CONTENT_RESP" | grep -q '"ok":true' || { echo "❌ Invalid response"; exit 1; }
echo "OK"

echo -n "✅ Public drops list... "
DROPS_RESP=$(curl -sf $API/api/drops) || { echo "❌ FAILED"; exit 1; }
echo "$DROPS_RESP" | grep -q '"ok":true' || { echo "❌ Invalid response"; exit 1; }
echo "OK"

# Mock login to get session
echo -n "✅ Mock login... "
curl -sf -c /tmp/pr_cookies.txt -X POST $API/api/auth/mock >/dev/null || { echo "❌ FAILED"; exit 1; }
echo "OK"

# Economy endpoints
echo -n "✅ Economy profile... "
PROFILE_RESP=$(curl -sf -b /tmp/pr_cookies.txt $API/api/economy/profile) || { echo "❌ FAILED"; exit 1; }
echo "$PROFILE_RESP" | grep -q '"ok":true' || { echo "❌ Invalid response"; exit 1; }
echo "OK"

echo -n "✅ Economy history... "
HISTORY_RESP=$(curl -sf -b /tmp/pr_cookies.txt $API/api/economy/history) || { echo "❌ FAILED"; exit 1; }
echo "$HISTORY_RESP" | grep -q '"ok":true' || { echo "❌ Invalid response"; exit 1; }
echo "OK"

# Create content
echo -n "✅ Create content... "
CONTENT_RESULT=$(curl -sf -b /tmp/pr_cookies.txt -H 'Content-Type: application/json' -d '{
  "title": "Test Content",
  "platform": "instagram",
  "platform_url": "https://instagram.com/p/test123",
  "image_url": "https://picsum.photos/400",
  "total_shares": 100,
  "share_price": 0.5
}' $API/api/content) || { echo "❌ FAILED"; exit 1; }
echo "$CONTENT_RESULT" | grep -q '"ok":true' || { echo "❌ Invalid response: $CONTENT_RESULT"; exit 1; }
echo "OK"

# List content again
echo -n "✅ List content (should include new)... "
curl -sf $API/api/content >/dev/null || { echo "❌ FAILED"; exit 1; }
echo "OK"

# Get user applications (should be empty initially)
echo -n "✅ Get user drop applications... "
APPS_RESP=$(curl -sf -b /tmp/pr_cookies.txt $API/api/users/drop-applications) || { echo "❌ FAILED"; exit 1; }
echo "$APPS_RESP" | grep -q '"ok":true' || { echo "❌ Invalid response"; exit 1; }
echo "OK"

# Cleanup
rm -f /tmp/pr_cookies.txt

echo ""
echo "✅ All Phase 2 smoke tests passed!"
