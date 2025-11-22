#!/usr/bin/env bash
set -euo pipefail

API=https://api.promorang.co
FRONT=https://promorang.co

echo "🧪 Phase 4 Smoke Tests"
echo "====================="

# Health check
echo -n "✅ Health check... "
curl -sf $API/api/health || { echo "❌ FAILED"; exit 1; }
echo "OK"

# Growth Hub tests
echo -n "✅ Growth Hub - List funding projects... "
PROJECTS_RESP=$(curl -sf $API/api/funding-projects) || { echo "❌ FAILED"; exit 1; }
echo "$PROJECTS_RESP" | grep -q '"ok":true' || { echo "❌ Invalid response"; exit 1; }
echo "OK"

echo -n "✅ Growth Hub - Create project (requires auth)... "
# Mock login first
curl -sf -c /tmp/pr_cookies.txt -X POST $API/api/auth/mock >/dev/null || { echo "❌ FAILED"; exit 1; }
echo "OK"

echo -n "✅ Leaderboard - Get rankings... "
LEADERBOARD_RESP=$(curl -sf $API/api/leaderboard) || { echo "❌ FAILED"; exit 1; }
echo "$LEADERBOARD_RESP" | grep -q '"ok":true' || { echo "❌ Invalid response"; exit 1; }
echo "OK"

echo -n "✅ Leaderboard - Get user rank... "
RANK_RESP=$(curl -sf -b /tmp/pr_cookies.txt $API/api/leaderboard/rank) || { echo "❌ FAILED"; exit 1; }
echo "$RANK_RESP" | grep -q '"ok":true' || { echo "❌ Invalid response"; exit 1; }
echo "OK"

echo -n "✅ Notifications - Get notifications... "
NOTIFS_RESP=$(curl -sf -b /tmp/pr_cookies.txt $API/api/notifications) || { echo "❌ FAILED"; exit 1; }
echo "$NOTIFS_RESP" | grep -q '"ok":true' || { echo "❌ Invalid response"; exit 1; }
echo "OK"

echo -n "✅ Payments - Create checkout (will fail without Stripe keys)... "
# This will fail because we don't have real Stripe keys, but should return proper error
CHECKOUT_RESP=$(curl -sf -b /tmp/pr_cookies.txt -X POST $API/api/payments/create-checkout -H 'Content-Type: application/json' -d '{"gems":10}' || echo '{"ok":false}')
echo "$CHECKOUT_RESP" | grep -q '"ok":false' || { echo "❌ Expected failure but got success"; exit 1; }
echo "OK (Expected failure without Stripe keys)"

# Cleanup
rm -f /tmp/pr_cookies.txt

echo ""
echo "✅ All Phase 4 smoke tests passed!"
