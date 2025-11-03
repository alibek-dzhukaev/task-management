#!/bin/bash

# Скрипт для запуска Auth Service

echo "🔐 Запуск Auth Service..."
echo "URL: http://localhost:3001"
echo ""

# Увеличиваем лимит файлов для macOS
ulimit -n 10240

# Переходим в корень проекта
cd "$(dirname "$0")/.." || exit

# Запускаем через Nx
npx nx serve auth-service

