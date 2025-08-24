"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.passwordResetLimiter = exports.emailVerificationLimiter = exports.clearFailedLoginAttempts = exports.incrementFailedLoginAttempts = exports.loginAttemptLimiter = exports.participationLimiter = exports.authLimiter = exports.generalLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const constants_1 = require("../config/constants");
const redis_1 = require("../config/redis");
const logger_1 = require("../utils/logger");
// General API rate limiter
exports.generalLimiter = (0, express_rate_limit_1.default)({
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
exports.authLimiter = (0, express_rate_limit_1.default)({
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
const participationLimiter = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: 'User not authenticated'
            });
        }
        const today = new Date().toISOString().split('T')[0];
        const cacheKey = `${constants_1.CACHE_KEYS.PARTICIPATION_LIMIT}${userId}:${today}`;
        const participationCount = await (0, redis_1.getCache)(cacheKey);
        if (participationCount && participationCount >= constants_1.RATE_LIMITS.PARTICIPATION_PER_DAY) {
            return res.status(constants_1.HTTP_STATUS.TOO_MANY_REQUESTS).json({
                success: false,
                message: 'You have already participated today. Please try again tomorrow.'
            });
        }
        // Store the participation attempt
        const newCount = (participationCount || 0) + 1;
        await (0, redis_1.setCache)(cacheKey, newCount, constants_1.CACHE_TTL.PARTICIPATION_LIMIT);
        next();
    }
    catch (error) {
        logger_1.logger.error('Participation rate limiter error:', error);
        next(); // Allow request to continue on error
    }
};
exports.participationLimiter = participationLimiter;
// Login attempt limiter with Redis
const loginAttemptLimiter = async (req, res, next) => {
    try {
        const { email } = req.body;
        const ip = req.ip;
        const cacheKey = `${constants_1.CACHE_KEYS.FAILED_LOGIN_ATTEMPTS}${email}:${ip}`;
        const attempts = await (0, redis_1.getCache)(cacheKey);
        if (attempts && attempts >= constants_1.RATE_LIMITS.LOGIN_ATTEMPTS) {
            return res.status(constants_1.HTTP_STATUS.TOO_MANY_REQUESTS).json({
                success: false,
                message: 'Too many failed login attempts. Please try again later.'
            });
        }
        next();
    }
    catch (error) {
        logger_1.logger.error('Login attempt limiter error:', error);
        next(); // Allow request to continue on error
    }
};
exports.loginAttemptLimiter = loginAttemptLimiter;
// Middleware to increment failed login attempts
const incrementFailedLoginAttempts = async (email, ip) => {
    try {
        const cacheKey = `${constants_1.CACHE_KEYS.FAILED_LOGIN_ATTEMPTS}${email}:${ip}`;
        const attempts = await (0, redis_1.getCache)(cacheKey) || 0;
        await (0, redis_1.setCache)(cacheKey, attempts + 1, constants_1.CACHE_TTL.FAILED_LOGIN_ATTEMPTS);
    }
    catch (error) {
        logger_1.logger.error('Failed to increment login attempts:', error);
    }
};
exports.incrementFailedLoginAttempts = incrementFailedLoginAttempts;
// Middleware to clear failed login attempts on successful login
const clearFailedLoginAttempts = async (email, ip) => {
    try {
        const cacheKey = `${constants_1.CACHE_KEYS.FAILED_LOGIN_ATTEMPTS}${email}:${ip}`;
        await (0, redis_1.setCache)(cacheKey, 0, 1); // Set to 0 with minimal TTL
    }
    catch (error) {
        logger_1.logger.error('Failed to clear login attempts:', error);
    }
};
exports.clearFailedLoginAttempts = clearFailedLoginAttempts;
// Email verification rate limiter
const emailVerificationLimiter = async (req, res, next) => {
    try {
        const { email } = req.body;
        const cacheKey = `${constants_1.CACHE_KEYS.EMAIL_VERIFICATION}${email}`;
        const attempts = await (0, redis_1.getCache)(cacheKey);
        if (attempts && attempts >= constants_1.RATE_LIMITS.EMAIL_VERIFICATION_ATTEMPTS) {
            return res.status(constants_1.HTTP_STATUS.TOO_MANY_REQUESTS).json({
                success: false,
                message: 'Too many email verification requests. Please try again later.'
            });
        }
        // Increment attempts
        const newAttempts = (attempts || 0) + 1;
        await (0, redis_1.setCache)(cacheKey, newAttempts, constants_1.CACHE_TTL.EMAIL_VERIFICATION);
        next();
    }
    catch (error) {
        logger_1.logger.error('Email verification limiter error:', error);
        next(); // Allow request to continue on error
    }
};
exports.emailVerificationLimiter = emailVerificationLimiter;
// Password reset rate limiter
const passwordResetLimiter = async (req, res, next) => {
    try {
        const { email } = req.body;
        const cacheKey = `${constants_1.CACHE_KEYS.PASSWORD_RESET}${email}`;
        const attempts = await (0, redis_1.getCache)(cacheKey);
        if (attempts && attempts >= constants_1.RATE_LIMITS.PASSWORD_RESET_ATTEMPTS) {
            return res.status(constants_1.HTTP_STATUS.TOO_MANY_REQUESTS).json({
                success: false,
                message: 'Too many password reset requests. Please try again later.'
            });
        }
        // Increment attempts
        const newAttempts = (attempts || 0) + 1;
        await (0, redis_1.setCache)(cacheKey, newAttempts, constants_1.CACHE_TTL.PASSWORD_RESET);
        next();
    }
    catch (error) {
        logger_1.logger.error('Password reset limiter error:', error);
        next(); // Allow request to continue on error
    }
};
exports.passwordResetLimiter = passwordResetLimiter;
//# sourceMappingURL=rateLimiter.middleware.js.map