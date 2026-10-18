#!/bin/sh

# Suppress test output by default, only show summary
export JEST_SILENT_REPORTER_SHOW_WARNINGS=false

# Get port from environment or use default
PORT="${PORT:-8000}"

# Function to check if server is responding
check_server() {
    for i in 1 2 3; do
        if curl -s "http://localhost:${PORT}/health" > /dev/null 2>&1; then
            return 0
        fi
        sleep 2
    done
    echo "   ❌ Server not responding"
    return 1
}

# Check if server is ready
echo -n "   🔍 Checking server... "
if ! check_server; then
    exit 1
fi
echo "Online!"

# Run REST API tests (suppress detailed output)
echo -n "   🧪 REST API tests... "
REST_OUTPUT=$(npm run test:rest 2>&1)
REST_EXIT=$?
REST_COUNT=$(echo "$REST_OUTPUT" | grep "Tests:" | tail -1 | grep -o '[0-9]* passed' | grep -o '[0-9]*')

if [ $REST_EXIT -ne 0 ]; then
    echo "❌ Failed"
    echo "$REST_OUTPUT"
    exit 1
fi
echo "✅ $REST_COUNT passed"

# Run GraphQL API tests (suppress detailed output)
echo -n "   🧪 GraphQL tests... "
GRAPHQL_OUTPUT=$(npm run test:graphql 2>&1)
GRAPHQL_EXIT=$?
GRAPHQL_COUNT=$(echo "$GRAPHQL_OUTPUT" | grep "Tests:" | tail -1 | grep -o '[0-9]* passed' | grep -o '[0-9]*')

if [ $GRAPHQL_EXIT -ne 0 ]; then
    echo "❌ Failed"
    echo "$GRAPHQL_OUTPUT"
    exit 1
fi
echo "✅ $GRAPHQL_COUNT passed"

# All tests passed
exit 0
