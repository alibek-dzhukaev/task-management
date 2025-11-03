import { consumeQueue, QueueNames, rabbitMQClient } from '@task-management/messaging';
import { handleUserEvent } from './app/handlers/user-events.handler';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3003;

async function startWorker() {
  console.log('Starting Email Worker...');
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

  try {
    await rabbitMQClient.connect();

    await consumeQueue(QueueNames.USER_REGISTERED, handleUserEvent);
    await consumeQueue(QueueNames.USER_CREATED, handleUserEvent);
    await consumeQueue(QueueNames.USER_UPDATED, handleUserEvent);
    await consumeQueue(QueueNames.USER_DELETED, handleUserEvent);

    console.log(`Email Worker running on ${host}:${port}`);
    console.log('Listening for events:');
    console.log(`  - ${QueueNames.USER_REGISTERED}`);
    console.log(`  - ${QueueNames.USER_CREATED}`);
    console.log(`  - ${QueueNames.USER_UPDATED}`);
    console.log(`  - ${QueueNames.USER_DELETED}`);
  } catch (error) {
    console.error('Failed to start Email Worker:', error);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  console.log('\nShutting down Email Worker...');
  await rabbitMQClient.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nShutting down Email Worker...');
  await rabbitMQClient.close();
  process.exit(0);
});

startWorker();

