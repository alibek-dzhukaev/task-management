import { rabbitMQClient } from './client';
import type { DomainEvent } from './events';

export type MessageHandler = (event: DomainEvent) => Promise<void>;

export async function consumeQueue(
  queue: string,
  handler: MessageHandler
): Promise<void> {
  try {
    const channel = await rabbitMQClient.getChannel();

    await channel.assertQueue(queue, {
      durable: true,
    });

    await channel.prefetch(1);

    console.log(`Waiting for messages in queue "${queue}"...`);

    await channel.consume(
      queue,
      async (msg: any) => {
        if (!msg) {
          return;
        }

        try {
          const content = msg.content.toString();
          const event: DomainEvent = JSON.parse(content);

          console.log(`Received event from queue "${queue}":`, event.type);

          await handler(event);

          channel.ack(msg);
          console.log(`Event processed successfully:`, event.type);
        } catch (error) {
          console.error('Error processing message:', error);
          channel.nack(msg, false, false);
        }
      },
      {
        noAck: false,
      }
    );
  } catch (error) {
    console.error(`Error consuming queue "${queue}":`, error);
    throw error;
  }
}
