#!/bin/bash

# Скрипт для запуска ВСЕХ сервисов одновременно

echo "🚀 Запуск ВСЕХ сервисов в монорепозитории..."
echo ""
echo "Сервисы:"
echo "  - Frontend (web):      http://localhost:4200"
echo "  - API Gateway:         http://localhost:3000"
echo "  - Auth Service:        http://localhost:3001"
echo "  - Users Service:       http://localhost:3002"
echo ""
echo "Нажмите Ctrl+C для остановки всех сервисов"
echo ""

# Увеличиваем лимит файлов для macOS
ulimit -n 10240

# Переходим в корень проекта
cd "$(dirname "$0")/.." || exit

# Запускаем все сервисы параллельно через Nx
echo "🚀 Запуск всех сервисов..."
npx nx run-many --target=serve --projects=apps,api-gateway,auth-service,users-service --parallel=4

# Альтернатива: можно запустить через отдельные скрипты в фоне
# ./scripts/dev-web.sh &
# ./scripts/dev-auth.sh &
# ./scripts/dev-users.sh &
# ./scripts/dev-gateway.sh &
# wait

