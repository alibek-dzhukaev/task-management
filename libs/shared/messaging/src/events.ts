export interface BaseEvent {
  type: string;
  timestamp: Date;
}

export interface UserCreatedEvent extends BaseEvent {
  type: 'user.created';
  userId: string;
  email: string;
  name: string;
}

export interface UserUpdatedEvent extends BaseEvent {
  type: 'user.updated';
  userId: string;
  changes: {
    email?: string;
    name?: string;
  };
}

export interface UserDeletedEvent extends BaseEvent {
  type: 'user.deleted';
  userId: string;
  email: string;
}

export interface UserRegisteredEvent extends BaseEvent {
  type: 'user.registered';
  userId: string;
  email: string;
  name: string;
}

export type DomainEvent =
  | UserCreatedEvent
  | UserUpdatedEvent
  | UserDeletedEvent
  | UserRegisteredEvent;

export const QueueNames = {
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_DELETED: 'user.deleted',
  USER_REGISTERED: 'user.registered',
} as const;

