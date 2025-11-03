import { FastifyInstance } from 'fastify';
import type {
  LoginDto,
  RegisterDto,
  AuthResponse,
  ApiResponse,
} from '@task-management/shared-types';
import { HttpStatus } from '@task-management/shared-types';
import { usersStorage } from '../storage/users.storage';
import { generateToken } from '../utils/jwt.utils';
import { publishEvent, QueueNames } from '@task-management/messaging';

export default async function (fastify: FastifyInstance) {
  fastify.post<{ Body: LoginDto }>('/login', async (request, reply) => {
    const { email, password } = request.body;

    if (!email || !password) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email and password are required',
        },
      };
      return reply.code(HttpStatus.BAD_REQUEST).send(response);
    }

    const user = await usersStorage.findByEmail(email);
    if (!user) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      };
      return reply.code(HttpStatus.UNAUTHORIZED).send(response);
    }

    const isValidPassword = usersStorage.verifyPassword(user, password);
    if (!isValidPassword) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      };
      return reply.code(HttpStatus.UNAUTHORIZED).send(response);
    }

    const token = generateToken(user.id, user.email);

    const authResponse: AuthResponse = {
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };

    const response: ApiResponse<AuthResponse> = {
      success: true,
      data: authResponse,
      message: 'Login successful',
    };

    return reply.code(HttpStatus.OK).send(response);
  });

  fastify.post<{ Body: RegisterDto }>('/register', async (request, reply) => {
    const { email, password, name } = request.body;

    if (!email || !password || !name) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email, password, and name are required',
        },
      };
      return reply.code(HttpStatus.BAD_REQUEST).send(response);
    }

    if (!email.includes('@')) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid email format',
        },
      };
      return reply.code(HttpStatus.BAD_REQUEST).send(response);
    }

    if (password.length < 6) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Password must be at least 6 characters',
        },
      };
      return reply.code(HttpStatus.BAD_REQUEST).send(response);
    }

    try {
      const user = await usersStorage.createUser({ email, password, name });
      const token = generateToken(user.id, user.email);

      await publishEvent(QueueNames.USER_REGISTERED, {
        type: 'user.registered',
        userId: user.id,
        email: user.email,
        name: user.name,
        timestamp: new Date(),
      });

      const authResponse: AuthResponse = {
        accessToken: token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      };

      const response: ApiResponse<AuthResponse> = {
        success: true,
        data: authResponse,
        message: 'Registration successful',
      };

      return reply.code(HttpStatus.CREATED).send(response);
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
  });

  fastify.get('/health', async () => {
    return {
      status: 'ok',
      service: 'auth-service',
      timestamp: new Date().toISOString(),
    };
  });
}

