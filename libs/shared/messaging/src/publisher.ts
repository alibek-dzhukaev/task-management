import { rabbitMQClient } from './client';
import type { DomainEvent } from './events';

export async function publishEvent(queue: string, event: DomainEvent): Promise<void> {
  try {
    const channel = await rabbitMQClient.getChannel();
    
    await channel.assertQueue(queue, {
      durable: true,
    });

    const message = JSON.stringify(event);
    const sent = channel.sendToQueue(queue, Buffer.from(message), {
      persistent: true,
    });

    if (sent) {
      console.log(`Event published to queue "${queue}":`, event.type);
    } else {
      console.warn(`Failed to publish event to queue "${queue}"`);
    }
  } catch (error) {
    console.error(`Error publishing event to queue "${queue}":`, error);
    throw error;
  }
}

