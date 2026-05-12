import { Request } from 'express';

/**
 * Extract JWT access token from cookies or Authorization header (fallback)
 */
export const extractJwtFromCookie = (req: Request): string | null => {
  if (req.cookies?.accessToken) {
    return req.cookies.accessToken;
  }

  // Fallback to Authorization header for backwards compatibility
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return null;
};

/**
 * Extract JWT refresh token from cookies or Authorization header (fallback)
 */
export const extractRefreshTokenFromCookie = (req: Request): string | null => {
  if (req.cookies?.refreshToken) {
    return req.cookies.refreshToken;
  }

  // Fallback to Authorization header for backwards compatibility
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return null;
};
