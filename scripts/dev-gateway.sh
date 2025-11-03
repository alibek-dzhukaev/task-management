#!/bin/bash

# Скрипт для запуска API Gateway

echo "🚪 Запуск API Gateway..."
echo "URL: http://localhost:3000"
echo ""
echo "Проксирует запросы:"
echo "  /auth/*  → http://localhost:3001 (auth-service)"
echo "  /users/* → http://localhost:3002 (users-service)"
echo ""

# Увеличиваем лимит файлов для macOS
ulimit -n 10240

# Переходим в корень проекта
cd "$(dirname "$0")/.." || exit

# Запускаем через Nx
npx nx serve api-gateway

