import { FastifyInstance } from 'fastify';
import type {
  UpdateUserDto,
  ApiResponse,
  UserResponse,
} from '@task-management/shared-types';
import { HttpStatus } from '@task-management/shared-types';
import { usersStorage } from '../storage/users.storage';
import { cache } from '@task-management/cache';

export default async function (fastify: FastifyInstance) {
  fastify.get('/users', async (request, reply) => {
    const cacheKey = 'users:all';
    const cached = await cache.get<UserResponse[]>(cacheKey);
    
    if (cached) {
      console.log('Cache HIT: users list');
      return reply.code(HttpStatus.OK).send({
        success: true,
        data: cached,
      });
    }
    
    console.log('Cache MISS: users list');
    const users = await usersStorage.getAllUsers();
    
    const sanitizedUsers: UserResponse[] = users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    }));

    await cache.set(cacheKey, sanitizedUsers, 300);

    const response: ApiResponse<UserResponse[]> = {
      success: true,
      data: sanitizedUsers,
    };

    return reply.code(HttpStatus.OK).send(response);
  });

  fastify.get<{ Params: { id: string } }>('/users/:id', async (request, reply) => {
    const { id } = request.params;

    const cacheKey = `user:${id}`;
    const cached = await cache.get<UserResponse>(cacheKey);
    
    if (cached) {
      console.log(`Cache HIT: user ${id}`);
      return reply.code(HttpStatus.OK).send({
        success: true,
        data: cached,
      });
    }
    
    console.log(`Cache MISS: user ${id}`);
    const user = await usersStorage.findById(id);
    if (!user) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        },
      };
      return reply.code(HttpStatus.NOT_FOUND).send(response);
    }

    const userResponse: UserResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };

    await cache.set(cacheKey, userResponse, 300);

    const response: ApiResponse<UserResponse> = {
      success: true,
      data: userResponse,
    };

    return reply.code(HttpStatus.OK).send(response);
  });

  fastify.put<{ Params: { id: string }; Body: UpdateUserDto }>(
    '/users/:id',
    async (request, reply) => {
      const { id } = request.params;
      const updateData = request.body;

      if (!updateData.email && !updateData.name && !updateData.password) {
        const response: ApiResponse = {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'At least one field (email, name, or password) must be provided',
          },
        };
        return reply.code(HttpStatus.BAD_REQUEST).send(response);
      }

      if (updateData.email && !updateData.email.includes('@')) {
        const response: ApiResponse = {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid email format',
          },
        };
        return reply.code(HttpStatus.BAD_REQUEST).send(response);
      }

      try {
        const updatedUser = await usersStorage.updateUser(id, updateData);
        
        if (!updatedUser) {
          const response: ApiResponse = {
            success: false,
            error: {
              code: 'USER_NOT_FOUND',
              message: 'User not found',
            },
          };
          return reply.code(HttpStatus.NOT_FOUND).send(response);
        }

        await cache.del(`user:${id}`);
        await cache.del('users:all');

        const userResponse: UserResponse = {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          createdAt: updatedUser.createdAt.toISOString(),
          updatedAt: updatedUser.updatedAt.toISOString(),
        };

        const response: ApiResponse<UserResponse> = {
          success: true,
          data: userResponse,
          message: 'User updated successfully',
        };

        return reply.code(HttpStatus.OK).send(response);
      } catch (error) {
        if (error instanceof Error && error.message === 'Email already exists') {
          const response: ApiResponse = {
            success: false,
            error: {
              code: 'EMAIL_EXISTS',
              message: 'User with this email already exists',
            },
          };
          return reply.code(HttpStatus.BAD_REQUEST).send(response);
        }
        throw error;
      }
    }
  );

  fastify.delete<{ Params: { id: string } }>('/users/:id', async (request, reply) => {
    const { id } = request.params;

    const deleted = await usersStorage.deleteUser(id);
    
    if (!deleted) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        },
      };
      return reply.code(HttpStatus.NOT_FOUND).send(response);
    }

    await cache.del(`user:${id}`);
    await cache.del('users:all');

    const response: ApiResponse = {
      success: true,
      message: 'User deleted successfully',
    };

    return reply.code(HttpStatus.OK).send(response);
  });

  fastify.get('/health', async () => {
    return {
      status: 'ok',
      service: 'users-service',
      timestamp: new Date().toISOString(),
    };
  });
}

