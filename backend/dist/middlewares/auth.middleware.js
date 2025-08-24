"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireClient = exports.requireEmployee = exports.requireAdmin = exports.requireRole = exports.requireEmailVerification = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const constants_1 = require("../config/constants");
const redis_1 = require("../config/redis");
const database_1 = __importDefault(require("../config/database"));
const logger_1 = require("../utils/logger");
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            return res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: 'Access token required'
            });
        }
        // Check if token is blacklisted
        const isBlacklisted = await (0, redis_1.getCache)(`blacklist:${token}`);
        if (isBlacklisted) {
            return res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: 'Token has been revoked'
            });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // Verify user still exists and is active
        const user = await database_1.default.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                role: true,
                emailVerified: true
            }
        });
        if (!user) {
            return res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json({
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
    }
    catch (error) {
        logger_1.logger.error('Authentication error:', error);
        return res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
};
exports.authenticateToken = authenticateToken;
const requireEmailVerification = (req, res, next) => {
    if (!req.user) {
        return res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json({
            success: false,
            message: 'User not authenticated'
        });
    }
    // Check if user's email is verified
    database_1.default.user.findUnique({
        where: { id: req.user.id },
        select: { emailVerified: true }
    }).then(user => {
        if (!user?.emailVerified) {
            return res.status(constants_1.HTTP_STATUS.FORBIDDEN).json({
                success: false,
                message: 'Email verification required'
            });
        }
        next();
    }).catch(error => {
        logger_1.logger.error('Email verification check error:', error);
        return res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Verification check failed'
        });
    });
};
exports.requireEmailVerification = requireEmailVerification;
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: 'User not authenticated'
            });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(constants_1.HTTP_STATUS.FORBIDDEN).json({
                success: false,
                message: 'Insufficient permissions'
            });
        }
        next();
    };
};
exports.requireRole = requireRole;
exports.requireAdmin = (0, exports.requireRole)([constants_1.ROLES.ADMIN]);
exports.requireEmployee = (0, exports.requireRole)([constants_1.ROLES.EMPLOYEE, constants_1.ROLES.ADMIN]);
exports.requireClient = (0, exports.requireRole)([constants_1.ROLES.CLIENT, constants_1.ROLES.EMPLOYEE, constants_1.ROLES.ADMIN]);
//# sourceMappingURL=auth.middleware.js.map