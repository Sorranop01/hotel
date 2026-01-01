import { Request, Response, NextFunction } from 'express';
import { auth } from '../config';
import { userRepository } from '../repositories';
import { ERROR_CODES } from '@shared/schemas';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email: string;
        role: string;
      };
      propertyId?: string;
    }
  }
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: { code: ERROR_CODES.UNAUTHORIZED, message: 'Token required' },
      });
      return;
    }

    const token = authHeader.split('Bearer ')[1];

    // Verify Firebase token
    const decodedToken = await auth.verifyIdToken(token);

    // Get user from database
    const user = await userRepository.findByFirebaseUid(decodedToken.uid);

    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        error: { code: ERROR_CODES.UNAUTHORIZED, message: 'User not found or inactive' },
      });
      return;
    }

    // Attach user to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      role: user.role,
    };

    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({
      success: false,
      error: { code: ERROR_CODES.INVALID_TOKEN, message: 'Invalid token' },
    });
  }
}

// Optional auth - doesn't fail if no token
export async function optionalAuthMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    const user = await userRepository.findByFirebaseUid(decodedToken.uid);

    if (user && user.isActive) {
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email || '',
        role: user.role,
      };
    }

    next();
  } catch {
    // Ignore auth errors for optional auth
    next();
  }
}

// Require specific role
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: ERROR_CODES.UNAUTHORIZED, message: 'Authentication required' },
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: { code: ERROR_CODES.FORBIDDEN, message: 'Insufficient permissions' },
      });
      return;
    }

    next();
  };
}
