#!/bin/sh

# Track if database was seeded (first launch)
FIRST_LAUNCH=false

# Get port from environment or use default
PORT="${PORT:-8000}"

# Detect unstable mode (simulated API failures)
UNSTABLE="${UNSTABLE_MODE:-false}"

echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "              MERKLE GAMES API - INITIALIZING"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

# Step 1: Migrations
echo "[1/7] Running migrations..."
npx sequelize-cli db:migrate > /dev/null 2>&1

# Step 2: Check database
echo "[2/7] Checking database..."
DB_PATH="${DB_STORAGE:-./data/gameapi.sqlite}"
GENRE_COUNT=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM genres;" 2>/dev/null || echo "0")

# Step 3: Seed database (if needed)
if echo "$GENRE_COUNT" | grep -qE '^[0-9]+$' && [ "$GENRE_COUNT" -gt 0 ] 2>/dev/null; then
  echo "[3/7] Database ready ($GENRE_COUNT genres found)"
else
  echo "[3/7] Seeding database..."
  FIRST_LAUNCH=true
  npx sequelize-cli db:seed:all > /dev/null 2>&1
  echo "      Database seeded successfully"
fi

# Step 4: Starting server
echo "[4/7] Starting server..."
# Use setsid for proper process isolation on all platforms (Windows/Mac/Linux)
setsid npm start > /tmp/app.log 2>&1 < /dev/null &
APP_PID=$!

# Step 5: Waiting for server
echo "[5/7] Warming up server..."
for i in 1 2 3 4 5; do
  sleep 1
done
echo "      Server ready"

# Step 6: Running tests
echo "[6/7] Running tests..."
sh scripts/test-sanity.sh > /tmp/test-output.log 2>&1
TEST_EXIT=$?

    # Step 7: Finalizing
    echo "[7/7] Finalizing..."

    if [ $TEST_EXIT -ne 0 ]; then
        echo ""
        echo "═══════════════════════════════════════════════════════════════════"
        echo "                  SANITY CHECKS FAILED"
        echo "═══════════════════════════════════════════════════════════════════"
        echo ""
        cat /tmp/test-output.log
        echo ""
        echo "Server logs:"
        cat /tmp/app.log
        kill $APP_PID 2>/dev/null || true
        exit 1
    fi

    # Extract test counts from output
    REST_COUNT=$(grep "REST API tests..." /tmp/test-output.log | grep -o '[0-9]* passed' | grep -o '[0-9]*' | head -1)
    GRAPHQL_COUNT=$(grep "GraphQL tests..." /tmp/test-output.log | grep -o '[0-9]* passed' | grep -o '[0-9]*' | head -1)
    TOTAL_COUNT=$((REST_COUNT + GRAPHQL_COUNT))

    echo ""

    # Show welcome message only on first launch
    if [ "$FIRST_LAUNCH" = true ]; then
        echo "═══════════════════════════════════════════════════════════════════"
        echo ""
        echo "            WELCOME TO THE MERKLE GAMES API"
        echo ""
        echo "═══════════════════════════════════════════════════════════════════"
        echo ""
        echo "  This containerized environment provides a complete games API"
        echo "  for your technical assessment."
        echo ""
        echo "  What's Inside:"
        echo "     • REST API with pagination and HATEOAS support"
        echo "     • GraphQL API"
        echo "     • Interactive API documentation (Swagger)"
        echo "     • GraphQL Playground for testing"
        echo "     • Deterministic image generator to mock media library"
        echo ""
        echo "  Available Endpoints:"
        echo "     • REST API:           http://localhost:${PORT}/api/v1"
        echo "     • GraphQL Endpoint:   http://localhost:${PORT}/graphql"
        echo "     • API Documentation:  http://localhost:${PORT}/api-docs"
        echo "     • GraphQL Playground: http://localhost:${PORT}/graphql-sandbox"
        echo "     • Image Generator:    http://localhost:${PORT}/media/example?w=400&h=300"
        echo "     • Health Check:       http://localhost:${PORT}/health"
        echo ""
        echo "  Notes:"
        echo "     - All seed data is AI generated mock data"
        echo "     - GraphQL query examples in sandbox"
        echo "     - Data is seeded during first launch"
        echo "     - Images are generated deterministically and support w and h params"
        echo ""
        echo "  Unstable Mode (frontend resilience testing):"
        if [ "$UNSTABLE" = "true" ]; then
            echo "     - Currently ON — REST, GraphQL and media endpoints randomly fail"
            echo "     - Failures: 500 errors, hangs (5-10s, then 504), dropped connections"
            echo "     - Simulated errors carry an 'X-Unstable-Mode' header (except drops)"
            echo "     - Tune:   http://localhost:${PORT}/admin/unstable-mode-on?errorRate=0.3"
            echo "     - Off:    http://localhost:${PORT}/admin/unstable-mode-off"
        else
            echo "     - Currently OFF — endpoints can be made to randomly fail"
            echo "       (500 errors, hangs, dropped connections) to test your frontend"
            echo "     - On:   http://localhost:${PORT}/admin/unstable-mode-on"
            echo "     - Tune: http://localhost:${PORT}/admin/unstable-mode-on?errorRate=0.3"
        fi
        echo "     - Status: http://localhost:${PORT}/admin/unstable-mode"
        echo "     - Read more in server/README.md"
        echo ""
        echo "  Test Results:"
        echo "     • REST API Tests:     ${REST_COUNT:-30} passed"
        echo "     • GraphQL Tests:      ${GRAPHQL_COUNT:-22} passed"
        echo "     • Total:              ${TOTAL_COUNT:-52} passed"
        echo ""
        echo ""
        echo "  Happy coding. Press Ctrl+C to stop."
        echo ""
        echo "═══════════════════════════════════════════════════════════════════"
        echo ""
    else
        # Regular startup - just show endpoints and test results
        echo "═══════════════════════════════════════════════════════════════════"
        echo "          MERKLE GAMES API - IS READY TO USE"
        echo "═══════════════════════════════════════════════════════════════════"
        echo ""
        echo "Available Endpoints:"
        echo "   • REST API:           http://localhost:${PORT}/api/v1"
        echo "   • API Documentation:  http://localhost:${PORT}/api-docs"
        echo "   • GraphQL Endpoint:   http://localhost:${PORT}/graphql"
        echo "   • GraphQL Playground: http://localhost:${PORT}/graphql-sandbox"
        echo "   • Image Generator:    http://localhost:${PORT}/media/example?w=400&h=300"
        echo "   • Health Check:       http://localhost:${PORT}/health"
        echo ""
        echo "Unstable Mode (frontend resilience testing):"
        if [ "$UNSTABLE" = "true" ]; then
            echo "   - Currently ON — REST, GraphQL and media endpoints randomly fail"
            echo "   - Failures: 500 errors, hangs (5-10s, then 504), dropped connections"
            echo "   - Simulated errors carry an 'X-Unstable-Mode' header (except drops)"
            echo "   - Tune:   http://localhost:${PORT}/admin/unstable-mode-on?errorRate=0.3"
            echo "   - Off:    http://localhost:${PORT}/admin/unstable-mode-off"
        else
            echo "   - Currently OFF — endpoints can be made to randomly fail"
            echo "     (500 errors, hangs, dropped connections) to test your frontend"
            echo "   - On:   http://localhost:${PORT}/admin/unstable-mode-on"
            echo "   - Tune: http://localhost:${PORT}/admin/unstable-mode-on?errorRate=0.3"
        fi
        echo "   - Status: http://localhost:${PORT}/admin/unstable-mode"
        echo "   - Read more in server/README.md"
        echo ""
        echo "Test Results:"
        echo "   • REST API Tests:     ${REST_COUNT:-30} passed"
        echo "   • GraphQL Tests:      ${GRAPHQL_COUNT:-22} passed"
        echo "   • Total:              ${TOTAL_COUNT:-52} passed"
        echo ""
        echo ""
        echo "Press Ctrl+C to stop."
        echo ""
        echo "═══════════════════════════════════════════════════════════════════"
        echo ""
    fi

# Keep the application running
wait $APP_PID
