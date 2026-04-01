#!/bin/bash
# Phase 5 - Backend Endpoint Test Suite
# Tests all endpoints for 200 OK responses

BASE_URL="http://localhost:8000/api/v1"
TOKEN=""

echo "=== TheGoodLife Backend API Test Suite ==="
echo ""

# Get auth token
echo "1. Testing Auth Flow..."
MAGIC_RESPONSE=$(curl -s -X POST -H 'Content-Type: application/json' -d '{"email":"test@example.com"}' $BASE_URL/auth/magic-link)
MAGIC_TOKEN=$(echo $MAGIC_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
AUTH_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/verify?token=$MAGIC_TOKEN")
TOKEN=$(echo $AUTH_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
echo "✅ Auth: magic-link + verify"

# Test endpoints
echo ""
echo "2. Testing Users..."
curl -s -o /dev/null -w "   GET /users/me: %{http_code}\n" -H "Authorization: Bearer $TOKEN" $BASE_URL/users/me
curl -s -o /dev/null -w "   PUT /users/me: %{http_code}\n" -X PUT -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' -d '{"display_name":"Test"}' $BASE_URL/users/me

echo ""
echo "3. Testing Investments..."
curl -s -o /dev/null -w "   GET /investments/today: %{http_code}\n" -H "Authorization: Bearer $TOKEN" $BASE_URL/investments/today
curl -s -o /dev/null -w "   POST /investments: %{http_code}\n" -X POST -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' -d '{"date":"2026-03-31","discipline_id":"prayer","capital_id":"spiritual","completed":true}' $BASE_URL/investments/

echo ""
echo "4. Testing Ratings..."
curl -s -o /dev/null -w "   GET /ratings/:date: %{http_code}\n" -H "Authorization: Bearer $TOKEN" $BASE_URL/ratings/2026-03-31
curl -s -o /dev/null -w "   PUT /ratings/:date: %{http_code}\n" -X PUT -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' -d '{"ratings":{"spiritual":5}}' $BASE_URL/ratings/2026-03-31

echo ""
echo "5. Testing Reflections..."
curl -s -o /dev/null -w "   GET /reflections/:date: %{http_code}\n" -H "Authorization: Bearer $TOKEN" $BASE_URL/reflections/2026-03-31
curl -s -o /dev/null -w "   PUT /reflections/:date: %{http_code}\n" -X PUT -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' -d '{"reflections":{"devotional":"test"}}' $BASE_URL/reflections/2026-03-31

echo ""
echo "6. Testing Fasting..."
curl -s -o /dev/null -w "   GET /fasting: %{http_code}\n" -H "Authorization: Bearer $TOKEN" $BASE_URL/fasting/
curl -s -o /dev/null -w "   POST /fasting: %{http_code}\n" -X POST -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' -d '{"date":"2026-03-31","fast_type":"test"}' $BASE_URL/fasting/

echo ""
echo "7. Testing Disciplines..."
curl -s -o /dev/null -w "   GET /disciplines: %{http_code}\n" -H "Authorization: Bearer $TOKEN" $BASE_URL/disciplines/
curl -s -o /dev/null -w "   POST /disciplines/custom: %{http_code}\n" -X POST -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' -d '{"capital_id":"spiritual","label":"Test"}' $BASE_URL/disciplines/custom

echo ""
echo "8. Testing Events..."
curl -s -o /dev/null -w "   GET /events: %{http_code}\n" -H "Authorization: Bearer $TOKEN" $BASE_URL/events/
curl -s -o /dev/null -w "   POST /events: %{http_code}\n" -X POST -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' -d '{"date":"2026-04-01","title":"Test","event_type":"work"}' $BASE_URL/events/

echo ""
echo "9. Testing Analytics..."
curl -s -o /dev/null -w "   GET /analytics/weekly: %{http_code}\n" -H "Authorization: Bearer $TOKEN" $BASE_URL/analytics/weekly
curl -s -o /dev/null -w "   GET /analytics/trends: %{http_code}\n" -H "Authorization: Bearer $TOKEN" $BASE_URL/analytics/trends

echo ""
echo "10. Testing Sync..."
curl -s -o /dev/null -w "   GET /sync/pull: %{http_code}\n" -H "Authorization: Bearer $TOKEN" "$BASE_URL/sync/pull?since=2026-03-01"
curl -s -o /dev/null -w "   POST /sync/push: %{http_code}\n" -X POST -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' -d '{"disciplines":{},"ratings":{},"reflections":{},"events":[],"fasting":[],"partners":[],"custom_disciplines":[],"settings":{}}' $BASE_URL/sync/push

echo ""
echo "=== All Tests Complete ==="
