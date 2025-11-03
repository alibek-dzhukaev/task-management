#!/bin/bash

# Скрипт для запуска Users Service

echo "👥 Запуск Users Service..."
echo "URL: http://localhost:3002"
echo ""

# Увеличиваем лимит файлов для macOS
ulimit -n 10240

# Переходим в корень проекта
cd "$(dirname "$0")/.." || exit

# Запускаем через Nx
npx nx serve users-service

