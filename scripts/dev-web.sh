#!/bin/bash

# Скрипт для запуска React приложения (Frontend)

echo "Starting React application (web)..."
echo "URL: http://localhost:4200"
echo ""

# Увеличиваем лимит файлов для macOS
ulimit -n 10240

# Переходим в корень проекта
cd "$(dirname "$0")/.." || exit

# Запускаем через Nx
npx nx dev apps

