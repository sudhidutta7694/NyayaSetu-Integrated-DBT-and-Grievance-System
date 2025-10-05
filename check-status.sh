#!/bin/bash
echo "🔍 NyayaSetu System Status Check"
echo "================================="
echo ""

# Check Docker containers
echo "📦 Docker Containers:"
$COMPOSE_CMD ps
echo ""

# Check service health
echo "🏥 Service Health:"
echo -n "Frontend (3000): "
if curl -f http://localhost:3000 >/dev/null 2>&1; then
    echo "✅ Running"
else
    echo "❌ Not responding"
fi

echo -n "Backend (8000):  "
if curl -f http://localhost:8000/health >/dev/null 2>&1; then
    echo "✅ Running"
else
    echo "❌ Not responding"
fi

echo -n "PostgreSQL (5433): "
if nc -z localhost 5433 >/dev/null 2>&1; then
    echo "✅ Running"
else
    echo "❌ Not responding"
fi

echo -n "Redis (6380):    "
if nc -z localhost 6380 >/dev/null 2>&1; then
    echo "✅ Running"
else
    echo "❌ Not responding"
fi
