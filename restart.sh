#!/bin/bash
echo "🔄 Restarting NyayaSetu DBT System..."
./stop.sh
sleep 2
./start.sh
