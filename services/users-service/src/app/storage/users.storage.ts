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
  async findById(id: string): Promise<StoredUser | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<StoredUser | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async updateUser(id: string, data: { email?: string; name?: string; password?: string }): Promise<StoredUser | null> {
    const user = await this.findById(id);
    if (!user) return null;

    if (data.email && data.email !== user.email) {
      const existingUser = await this.findByEmail(data.email);
      if (existingUser) {
        throw new Error('Email already exists');
      }
    }

    return prisma.user.update({
      where: { id },
      data,
    });
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      await prisma.user.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
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

