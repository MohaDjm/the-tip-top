import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { HTTP_STATUS, ROLES } from '../config/constants';
import { getCache } from '../config/redis';
import prisma from '../config/database';
import { logger } from '../utils/logger';

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Access token required'
      });
    }

    // Check if token is blacklisted
    const isBlacklisted = await getCache(`blacklist:${token}`);
    if (isBlacklisted) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Token has been revoked'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    
    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        emailVerified: true
      }
    });

    if (!user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'User not found'
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

export const requireEmailVerification = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: 'User not authenticated'
    });
  }

  // Check if user's email is verified
  prisma.user.findUnique({
    where: { id: req.user.id },
    select: { emailVerified: true }
  }).then(user => {
    if (!user?.emailVerified) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'Email verification required'
      });
    }
    next();
  }).catch(error => {
    logger.error('Email verification check error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Verification check failed'
    });
  });
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

export const requireAdmin = requireRole([ROLES.ADMIN]);
export const requireEmployee = requireRole([ROLES.EMPLOYEE, ROLES.ADMIN]);
export const requireClient = requireRole([ROLES.CLIENT, ROLES.EMPLOYEE, ROLES.ADMIN]);
