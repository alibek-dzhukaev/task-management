import type {
  DomainEvent,
  UserCreatedEvent,
  UserUpdatedEvent,
  UserDeletedEvent,
  UserRegisteredEvent,
} from '@task-management/messaging';
import { emailService } from '../services/email.service';

export async function handleUserEvent(event: DomainEvent): Promise<void> {
  switch (event.type) {
    case 'user.registered':
      await handleUserRegistered(event);
      break;
    case 'user.created':
      await handleUserCreated(event);
      break;
    case 'user.updated':
      await handleUserUpdated(event);
      break;
    case 'user.deleted':
      await handleUserDeleted(event);
      break;
    default:
      console.warn('Unknown event type:', (event as DomainEvent).type);
  }
}

async function handleUserRegistered(event: UserRegisteredEvent): Promise<void> {
  console.log(`Processing UserRegisteredEvent for user: ${event.email}`);
  await emailService.sendWelcomeEmail(event.name, event.email);
}

async function handleUserCreated(event: UserCreatedEvent): Promise<void> {
  console.log(`Processing UserCreatedEvent for user: ${event.email}`);
  await emailService.sendWelcomeEmail(event.name, event.email);
}

async function handleUserUpdated(event: UserUpdatedEvent): Promise<void> {
  console.log(`Processing UserUpdatedEvent for user: ${event.userId}`);
  
  if (event.changes.email || event.changes.name) {
    const name = event.changes.name || 'User';
    const email = event.changes.email || '';
    
    if (email) {
      await emailService.sendProfileUpdateEmail(name, email);
    }
  }
}

async function handleUserDeleted(event: UserDeletedEvent): Promise<void> {
  console.log(`Processing UserDeletedEvent for user: ${event.email}`);
  await emailService.sendAccountDeletionEmail('User', event.email);
}

