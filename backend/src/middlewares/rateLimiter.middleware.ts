import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { HTTP_STATUS, RATE_LIMITS, CACHE_KEYS, CACHE_TTL } from '../config/constants';
import { getCache, setCache } from '../config/redis';
import { logger } from '../utils/logger';

// General API rate limiter
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Participation rate limiter (1 per day per user)
export const participationLimiter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const today = new Date().toISOString().split('T')[0];
    const cacheKey = `${CACHE_KEYS.PARTICIPATION_LIMIT}${userId}:${today}`;
    
    const participationCount = await getCache(cacheKey);
    
    if (participationCount && participationCount >= RATE_LIMITS.PARTICIPATION_PER_DAY) {
      return res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
        success: false,
        message: 'You have already participated today. Please try again tomorrow.'
      });
    }

    // Store the participation attempt
    const newCount = (participationCount || 0) + 1;
    await setCache(cacheKey, newCount, CACHE_TTL.PARTICIPATION_LIMIT);

    next();
  } catch (error) {
    logger.error('Participation rate limiter error:', error);
    next(); // Allow request to continue on error
  }
};

// Login attempt limiter with Redis
export const loginAttemptLimiter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    const ip = req.ip;
    const cacheKey = `${CACHE_KEYS.FAILED_LOGIN_ATTEMPTS}${email}:${ip}`;
    
    const attempts = await getCache(cacheKey);
    
    if (attempts && attempts >= RATE_LIMITS.LOGIN_ATTEMPTS) {
      return res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
        success: false,
        message: 'Too many failed login attempts. Please try again later.'
      });
    }

    next();
  } catch (error) {
    logger.error('Login attempt limiter error:', error);
    next(); // Allow request to continue on error
  }
};

// Middleware to increment failed login attempts
export const incrementFailedLoginAttempts = async (email: string, ip: string) => {
  try {
    const cacheKey = `${CACHE_KEYS.FAILED_LOGIN_ATTEMPTS}${email}:${ip}`;
    const attempts = await getCache(cacheKey) || 0;
    await setCache(cacheKey, attempts + 1, CACHE_TTL.FAILED_LOGIN_ATTEMPTS);
  } catch (error) {
    logger.error('Failed to increment login attempts:', error);
  }
};

// Middleware to clear failed login attempts on successful login
export const clearFailedLoginAttempts = async (email: string, ip: string) => {
  try {
    const cacheKey = `${CACHE_KEYS.FAILED_LOGIN_ATTEMPTS}${email}:${ip}`;
    await setCache(cacheKey, 0, 1); // Set to 0 with minimal TTL
  } catch (error) {
    logger.error('Failed to clear login attempts:', error);
  }
};

// Email verification rate limiter
export const emailVerificationLimiter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    const cacheKey = `${CACHE_KEYS.EMAIL_VERIFICATION}${email}`;
    
    const attempts = await getCache(cacheKey);
    
    if (attempts && attempts >= RATE_LIMITS.EMAIL_VERIFICATION_ATTEMPTS) {
      return res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
        success: false,
        message: 'Too many email verification requests. Please try again later.'
      });
    }

    // Increment attempts
    const newAttempts = (attempts || 0) + 1;
    await setCache(cacheKey, newAttempts, CACHE_TTL.EMAIL_VERIFICATION);

    next();
  } catch (error) {
    logger.error('Email verification limiter error:', error);
    next(); // Allow request to continue on error
  }
};

// Password reset rate limiter
export const passwordResetLimiter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    const cacheKey = `${CACHE_KEYS.PASSWORD_RESET}${email}`;
    
    const attempts = await getCache(cacheKey);
    
    if (attempts && attempts >= RATE_LIMITS.PASSWORD_RESET_ATTEMPTS) {
      return res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
        success: false,
        message: 'Too many password reset requests. Please try again later.'
      });
    }

    // Increment attempts
    const newAttempts = (attempts || 0) + 1;
    await setCache(cacheKey, newAttempts, CACHE_TTL.PASSWORD_RESET);

    next();
  } catch (error) {
    logger.error('Password reset limiter error:', error);
    next(); // Allow request to continue on error
  }
};
