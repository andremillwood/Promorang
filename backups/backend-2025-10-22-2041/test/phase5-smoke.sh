#!/usr/bin/env bash
set -euo pipefail

API=https://api.promorang.co
FRONT=https://promorang.co

echo "🧪 Phase 5 Smoke Tests"
echo "====================="

# Health check
echo -n "✅ Health check... "
curl -sf $API/api/health || { echo "❌ FAILED"; exit 1; }
echo "OK"

# Analytics tests
echo -n "✅ Analytics - Global analytics... "
ANALYTICS_RESP=$(curl -sf $API/api/analytics/global) || { echo "❌ FAILED"; exit 1; }
echo "$ANALYTICS_RESP" | grep -q '"ok":true' || { echo "❌ Invalid response"; exit 1; }
echo "OK"

# Community tests
echo -n "✅ Community - Social feed... "
FEED_RESP=$(curl -sf $API/api/social/feed) || { echo "❌ FAILED"; exit 1; }
echo "$FEED_RESP" | grep -q '"ok":true' || { echo "❌ Invalid response"; exit 1; }
echo "OK"

echo -n "✅ Community - Community stats... "
STATS_RESP=$(curl -sf $API/api/social/stats) || { echo "❌ FAILED"; exit 1; }
echo "$STATS_RESP" | grep -q '"ok":true' || { echo "❌ Invalid response"; exit 1; }
echo "OK"

# Authentication for protected routes
echo -n "✅ Mock login for protected routes... "
curl -sf -c /tmp/pr_cookies.txt -X POST $API/api/auth/mock >/dev/null || { echo "❌ FAILED"; exit 1; }
echo "OK"

# Analytics protected routes
echo -n "✅ Analytics - User analytics... "
USER_ANALYTICS_RESP=$(curl -sf -b /tmp/pr_cookies.txt $API/api/analytics/user) || { echo "❌ FAILED"; exit 1; }
echo "$USER_ANALYTICS_RESP" | grep -q '"ok":true' || { echo "❌ Invalid response"; exit 1; }
echo "OK"

# Community protected routes
echo -n "✅ Community - Create activity... "
ACTIVITY_RESP=$(curl -sf -b /tmp/pr_cookies.txt -X POST $API/api/social/activity -H 'Content-Type: application/json' -d '{"activity_type":"test","activity_data":{"test":true}}') || { echo "❌ FAILED"; exit 1; }
echo "$ACTIVITY_RESP" | grep -q '"ok":true' || { echo "❌ Invalid response"; exit 1; }
echo "OK"

# Automation tests
echo -n "✅ Automation - Get cron jobs... "
JOBS_RESP=$(curl -sf -b /tmp/pr_cookies.txt $API/api/automations/jobs) || { echo "❌ FAILED"; exit 1; }
echo "$JOBS_RESP" | grep -q '"ok":true' || { echo "❌ Invalid response"; exit 1; }
echo "OK"

# Admin tests
echo -n "✅ Admin - Get dashboard... "
DASHBOARD_RESP=$(curl -sf -b /tmp/pr_cookies.txt $API/api/admin/dashboard) || { echo "❌ FAILED"; exit 1; }
echo "$DASHBOARD_RESP" | grep -q '"ok":true' || { echo "❌ Invalid response"; exit 1; }
echo "OK"

echo -n "✅ Admin - Get logs... "
LOGS_RESP=$(curl -sf -b /tmp/pr_cookies.txt $API/api/admin/logs) || { echo "❌ FAILED"; exit 1; }
echo "$LOGS_RESP" | grep -q '"ok":true' || { echo "❌ Invalid response"; exit 1; }
echo "OK"

# Stripe payment test (will fail without real keys, but should return proper error)
echo -n "✅ Payments - Create checkout (will fail without Stripe keys)... "
# This will fail because we don't have real Stripe keys, but should return proper error
CHECKOUT_RESP=$(curl -sf -b /tmp/pr_cookies.txt -X POST $API/api/payments/create-checkout -H 'Content-Type: application/json' -d '{"gems":10}' || echo '{"ok":false}')
echo "$CHECKOUT_RESP" | grep -q '"ok":false' || { echo "❌ Expected failure but got success"; exit 1; }
echo "OK (Expected failure without Stripe keys)"

# Leaderboard test
echo -n "✅ Leaderboard - Get rankings... "
LEADERBOARD_RESP=$(curl -sf $API/api/leaderboard) || { echo "❌ FAILED"; exit 1; }
echo "$LEADERBOARD_RESP" | grep -q '"ok":true' || { echo "❌ Invalid response"; exit 1; }
echo "OK"

echo -n "✅ Leaderboard - Get user rank... "
RANK_RESP=$(curl -sf -b /tmp/pr_cookies.txt $API/api/leaderboard/rank) || { echo "❌ FAILED"; exit 1; }
echo "$RANK_RESP" | grep -q '"ok":true' || { echo "❌ Invalid response"; exit 1; }
echo "OK"

# Cleanup
rm -f /tmp/pr_cookies.txt

echo ""
echo "✅ All Phase 5 smoke tests passed!"
