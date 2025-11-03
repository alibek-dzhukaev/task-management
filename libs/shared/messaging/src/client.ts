import * as amqplib from 'amqplib';

class RabbitMQClient {
  private connection: any = null;
  private channel: any = null;
  private readonly url: string;
  private isConnecting = false;

  constructor() {
    this.url = process.env.RABBITMQ_URL || 'amqp://taskrabbit:rabbit_dev_password@localhost:5672';
  }

  async connect(): Promise<void> {
    if (this.connection && this.channel) {
      return;
    }

    if (this.isConnecting) {
      await this.waitForConnection();
      return;
    }

    this.isConnecting = true;

    try {
      this.connection = await amqplib.connect(this.url);
      this.channel = await this.connection.createChannel();

      this.connection.on('error', (err: Error) => {
        console.error('RabbitMQ connection error:', err);
        this.connection = null;
        this.channel = null;
      });

      this.connection.on('close', () => {
        console.log('RabbitMQ connection closed');
        this.connection = null;
        this.channel = null;
      });

      console.log('RabbitMQ connected');
    } catch (error) {
      console.error('Failed to connect to RabbitMQ:', error);
      this.connection = null;
      this.channel = null;
      throw error;
    } finally {
      this.isConnecting = false;
    }
  }

  private async waitForConnection(): Promise<void> {
    while (this.isConnecting) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  async getChannel(): Promise<any> {
    if (!this.channel) {
      await this.connect();
    }
    if (!this.channel) {
      throw new Error('Failed to establish RabbitMQ channel');
    }
    return this.channel;
  }

  async close(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
        this.channel = null;
      }
      if (this.connection) {
        await this.connection.close();
        this.connection = null;
      }
      console.log('RabbitMQ connection closed gracefully');
    } catch (error) {
      console.error('Error closing RabbitMQ connection:', error);
    }
  }
}

export const rabbitMQClient = new RabbitMQClient();
