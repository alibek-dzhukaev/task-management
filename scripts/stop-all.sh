#!/bin/bash

# Скрипт для остановки ВСЕХ запущенных сервисов

echo "Stopping all services..."
echo ""

# Порты наших сервисов
PORTS=(4200 3000 3001 3002)

for PORT in "${PORTS[@]}"; do
  PID=$(lsof -ti:$PORT 2>/dev/null)
  if [ -n "$PID" ]; then
    kill -9 "$PID" 2>/dev/null
    echo "Stopped service on port $PORT (PID: $PID)"
  else
    echo "Port $PORT is free"
  fi
done

echo ""
echo "All services stopped!"

