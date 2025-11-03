interface StoredUser {
  id: string;
  email: string;
  password: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

class UsersStorage {
  private users: Map<string, StoredUser> = new Map();
  private emailIndex: Map<string, string> = new Map(); // email -> userId

  constructor() {
    this.createUser({
      email: 'admin@test.com',
      password: 'admin123',
      name: 'Admin User',
    });

    this.createUser({
      email: 'user@test.com',
      password: 'user123',
      name: 'Test User',
    });
  }

  createUser(data: { email: string; password: string; name: string }): StoredUser {
    if (this.emailIndex.has(data.email)) {
      throw new Error('Email already exists');
    }

    const user: StoredUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email: data.email,
      password: data.password,
      name: data.name,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.set(user.id, user);
    this.emailIndex.set(user.email, user.id);

    return user;
  }

  findByEmail(email: string): StoredUser | undefined {
    const userId = this.emailIndex.get(email);
    if (!userId) return undefined;
    return this.users.get(userId);
  }

  findById(id: string): StoredUser | undefined {
    return this.users.get(id);
  }

  verifyPassword(user: StoredUser, password: string): boolean {
    return user.password === password;
  }

  getAllUsers(): StoredUser[] {
    return Array.from(this.users.values());
  }

  sanitizeUser(user: StoredUser): Omit<StoredUser, 'password'> {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

// Singleton instance
export const usersStorage = new UsersStorage();

