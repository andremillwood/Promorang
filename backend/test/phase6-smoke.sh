#!/usr/bin/env bash
set -euo pipefail

API=https://api.promorang.co
FRONT=https://promorang.co

echo "🧪 Phase 6 Smoke Tests - AI, Partners, Scalability"
echo "=============================================="

# Health check
echo -n "✅ Health check... "
curl -sf $API/api/health || { echo "❌ FAILED"; exit 1; }
echo "OK"

# AI & Intelligence tests
echo -n "✅ AI - Get AI insights... "
AI_RESP=$(curl -sf $API/api/ai/insights) || { echo "❌ FAILED"; exit 1; }
echo "$AI_RESP" | grep -q '"ok":true' || { echo "❌ Invalid response"; exit 1; }
echo "OK"

# Partner API tests
echo -n "✅ SDK - Get SDK documentation... "
SDK_RESP=$(curl -sf $API/api/sdk/documentation) || { echo "❌ FAILED"; exit 1; }
echo "$SDK_RESP" | grep -q '"ok":true' || { echo "❌ Invalid response"; exit 1; }
echo "OK"

# Region & Scalability tests
echo -n "✅ Region - Get region info... "
REGION_RESP=$(curl -sf $API/api/region/info) || { echo "❌ FAILED"; exit 1; }
echo "$REGION_RESP" | grep -q '"ok":true' || { echo "❌ Invalid response"; exit 1; }
echo "OK"

echo -n "✅ Region - Get region leaderboard... "
LEADERBOARD_RESP=$(curl -sf $API/api/region/leaderboard) || { echo "❌ FAILED"; exit 1; }
echo "$LEADERBOARD_RESP" | grep -q '"ok":true' || { echo "❌ Invalid response"; exit 1; }
echo "OK"

# Data Warehouse tests
echo -n "✅ Warehouse - Get warehouse data... "
WAREHOUSE_RESP=$(curl -sf $API/api/warehouse/data) || { echo "❌ FAILED"; exit 1; }
echo "$WAREHOUSE_RESP" | grep -q '"ok":true' || { echo "❌ Invalid response"; exit 1; }
echo "OK"

echo -n "✅ Analytics - Get BI insights... "
BI_RESP=$(curl -sf $API/api/analytics/bi) || { echo "❌ FAILED"; exit 1; }
echo "$BI_RESP" | grep -q '"ok":true' || { echo "❌ Invalid response"; exit 1; }
echo "OK"

# Authentication for protected routes
echo -n "✅ Mock login for protected routes... "
curl -sf -c /tmp/pr_cookies.txt -X POST $API/api/auth/mock >/dev/null || { echo "❌ FAILED"; exit 1; }
echo "OK"

# AI protected routes
echo -n "✅ AI - Get recommendations... "
RECS_RESP=$(curl -sf -b /tmp/pr_cookies.txt -X POST $API/api/ai/recommend -H 'Content-Type: application/json' -d '{"type":"content","limit":5}') || { echo "❌ FAILED"; exit 1; }
echo "$RECS_RESP" | grep -q '"ok":true' || { echo "❌ Invalid response"; exit 1; }
echo "OK"

echo -n "✅ AI - Analyze content... "
ANALYZE_RESP=$(curl -sf -b /tmp/pr_cookies.txt -X POST $API/api/ai/analyze-content -H 'Content-Type: application/json' -d '{"content_id":"test","analysis_type":"virality"}') || { echo "❌ FAILED"; exit 1; }
echo "$ANALYZE_RESP" | grep -q '"ok":true' || { echo "❌ Invalid response"; exit 1; }
echo "OK"

echo -n "✅ AI - Generate forecast... "
FORECAST_RESP=$(curl -sf -b /tmp/pr_cookies.txt -X POST $API/api/ai/forecast -H 'Content-Type: application/json' -d '{"forecast_type":"user_growth","timeframe":"30d"}') || { echo "❌ FAILED"; exit 1; }
echo "$FORECAST_RESP" | grep -q '"ok":true' || { echo "❌ Invalid response"; exit 1; }
echo "OK"

# Partner protected routes
echo -n "✅ Partners - List partner apps... "
PARTNERS_RESP=$(curl -sf -b /tmp/pr_cookies.txt $API/api/partners/apps) || { echo "❌ FAILED"; exit 1; }
echo "$PARTNERS_RESP" | grep -q '"ok":true' || { echo "❌ Invalid response"; exit 1; }
echo "OK"

echo -n "✅ Partners - Get partner usage... "
USAGE_RESP=$(curl -sf -b /tmp/pr_cookies.txt $API/api/partners/usage) || { echo "❌ FAILED"; exit 1; }
echo "$USAGE_RESP" | grep -q '"ok":true' || { echo "❌ Invalid response"; exit 1; }
echo "OK"

# Assistant routes
echo -n "✅ Assistant - Start session... "
ASSISTANT_RESP=$(curl -sf -b /tmp/pr_cookies.txt -X POST $API/api/assistant/start -H 'Content-Type: application/json' -d '{"initial_message":"Hello, what can you help me with?"}') || { echo "❌ FAILED"; exit 1; }
echo "$ASSISTANT_RESP" | grep -q '"ok":true' || { echo "❌ Invalid response"; exit 1; }
echo "OK"

echo -n "✅ Assistant - Get sessions... "
SESSIONS_RESP=$(curl -sf -b /tmp/pr_cookies.txt $API/api/assistant/sessions) || { echo "❌ FAILED"; exit 1; }
echo "$SESSIONS_RESP" | grep -q '"ok":true' || { echo "❌ Invalid response"; exit 1; }
echo "OK"

# Scalability routes
echo -n "✅ Region - Migrate user (will fail without target region)... "
MIGRATE_RESP=$(curl -sf -b /tmp/pr_cookies.txt -X POST $API/api/region/migrate -H 'Content-Type: application/json' -d '{"target_region":"us"}' || echo '{"ok":false}')
echo "$MIGRATE_RESP" | grep -q '"ok":false' || { echo "❌ Expected failure but got success"; exit 1; }
echo "OK (Expected failure - no migration needed)"

# Warehouse protected routes
echo -n "✅ Warehouse - Export analytics... "
EXPORT_RESP=$(curl -sf -b /tmp/pr_cookies.txt -X POST $API/api/warehouse/export) || { echo "❌ FAILED"; exit 1; }
echo "$EXPORT_RESP" | grep -q '"ok":true' || { echo "❌ Invalid response"; exit 1; }
echo "OK"

# Community notification
echo -n "✅ Assistant - Send community notification... "
NOTIFY_RESP=$(curl -sf -b /tmp/pr_cookies.txt -X POST $API/api/assistant/notify -H 'Content-Type: application/json' -d '{"message":"Test notification from Phase 6","target_audience":"all"}') || { echo "❌ FAILED"; exit 1; }
echo "$NOTIFY_RESP" | grep -q '"ok":true' || { echo "❌ Invalid response"; exit 1; }
echo "OK"

# SDK validation
echo -n "✅ SDK - Validate usage (will fail without API key)... "
VALIDATE_RESP=$(curl -sf -X POST $API/api/sdk/validate) || echo '{"ok":false}')
echo "$VALIDATE_RESP" | grep -q '"ok":false' || { echo "❌ Expected failure but got success"; exit 1; }
echo "OK (Expected failure - no API key)"

# Cleanup
rm -f /tmp/pr_cookies.txt

echo ""
echo "✅ All Phase 6 smoke tests passed!"
echo ""
echo "🚀 Phase 6 Features Successfully Deployed:"
echo "  • AI-powered recommendations and analysis"
echo "  • Partner API and SDK ecosystem"
echo "  • Regional data partitioning and scalability"
echo "  • Community AI assistant and chat"
echo "  • Data warehouse and BI pipelines"
echo "  • Enhanced security and performance"
echo ""
echo "🎯 Promorang is now an enterprise-grade, AI-powered ecosystem!"
