import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../config/env.config';
import { AuthTokenPayload } from './auth.types';

export const COOKIE_NAME = 'accessToken';

/**
 * Generate a signed JWT for the authenticated user
 */
export const generateToken = (payload: AuthTokenPayload): string => {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as jwt.Secret | any,
  });
};

/**
 * Verify JWT token
 */
export const verifyToken = (token: string): AuthTokenPayload => {
  return jwt.verify(token, config.jwtSecret) as AuthTokenPayload;
};

/**
 * Attach HttpOnly cookie with secure configuration
 */
export const sendTokenCookie = (res: Response, token: string): void => {
  const cookieOptions = {
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: config.env === 'production' ? ('none' as const) : ('lax' as const),
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  };

  res.cookie(COOKIE_NAME, token, cookieOptions);
};

/**
 * Clear HttpOnly authentication cookie
 */
export const clearTokenCookie = (res: Response): void => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: config.env === 'production' ? ('none' as const) : ('lax' as const),
  });
};
