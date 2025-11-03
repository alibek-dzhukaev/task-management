import type { TokenPayload } from '@task-management/shared-types';

const SECRET = 'super-secret-key-change-in-production';

export function generateToken(userId: string, email: string): string {
  const payload: TokenPayload = {
    userId,
    email,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24),
  };

  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64url');
  
  return `${header}.${payloadStr}.${SECRET}`;
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const [header, payloadStr, signature] = token.split('.');
    
    if (!header || !payloadStr || !signature) {
      return null;
    }

    const payload: TokenPayload = JSON.parse(
      Buffer.from(payloadStr, 'base64url').toString('utf-8')
    );

    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch (error) {
    return null;
  }
}

