#!/bin/bash

# Скрипт для запуска ВСЕХ сервисов одновременно

echo "Starting all services..."
echo ""
echo "Services:"
echo "  - Frontend (web):      http://localhost:4200"
echo "  - API Gateway:         http://localhost:3000"
echo "  - Auth Service:        http://localhost:3001"
echo "  - Users Service:       http://localhost:3002"
echo "  - Email Worker:        :3003"
echo ""
echo "RabbitMQ:"
echo "  - Management UI:       http://localhost:15672"
echo "  - Username:            taskrabbit"
echo "  - Password:            rabbit_dev_password"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Увеличиваем лимит файлов для macOS
ulimit -n 10240

# Переходим в корень проекта
cd "$(dirname "$0")/.." || exit

# Запускаем все сервисы параллельно через Nx
echo "Starting services..."
npx nx run-many --target=serve --projects=apps,api-gateway,auth-service,users-service,email-worker --parallel=5

# Альтернатива: можно запустить через отдельные скрипты в фоне
# ./scripts/dev-web.sh &
# ./scripts/dev-auth.sh &
# ./scripts/dev-users.sh &
# ./scripts/dev-gateway.sh &
# wait

