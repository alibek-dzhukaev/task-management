import { prisma } from '@task-management/database';

interface StoredUser {
  id: string;
  email: string;
  password: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

class UsersStorage {
  async createUser(data: { email: string; password: string; name: string }): Promise<StoredUser> {
    const existingUser = await this.findByEmail(data.email);
    if (existingUser) {
      throw new Error('Email already exists');
    }

    const user = await prisma.user.create({
      data,
    });

    return user;
  }

  async findByEmail(email: string): Promise<StoredUser | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string): Promise<StoredUser | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  verifyPassword(user: StoredUser, password: string): boolean {
    return user.password === password;
  }

  async getAllUsers(): Promise<StoredUser[]> {
    return prisma.user.findMany();
  }

  sanitizeUser(user: StoredUser): Omit<StoredUser, 'password'> {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

export const usersStorage = new UsersStorage();

