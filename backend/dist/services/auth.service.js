"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = __importDefault(require("../config/database"));
const email_service_1 = require("./email.service");
const redis_1 = require("../config/redis");
const constants_1 = require("../config/constants");
const rateLimiter_middleware_1 = require("../middlewares/rateLimiter.middleware");
class AuthService {
    emailService;
    constructor() {
        this.emailService = new email_service_1.EmailService();
    }
    async register(userData) {
        const { email, password, ...otherData } = userData;
        // Check if user already exists
        const existingUser = await database_1.default.user.findUnique({
            where: { email }
        });
        if (existingUser) {
            const error = new Error('User already exists with this email');
            error.statusCode = constants_1.HTTP_STATUS.CONFLICT;
            throw error;
        }
        // Hash password
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        // Create user
        const user = await database_1.default.user.create({
            data: {
                email,
                password: hashedPassword,
                ...otherData,
                role: 'CLIENT',
            }
        });
        // Generate email verification token
        const verificationToken = this.generateEmailVerificationToken(user.id, user.email);
        // Send verification email
        await this.emailService.sendEmailVerification(user.email, user.firstName, verificationToken);
        const { password: _, ...userWithoutPassword } = user;
        return {
            user: userWithoutPassword,
            message: 'Registration successful. Please check your email to verify your account.'
        };
    }
    async login(email, password, ipAddress, userAgent) {
        try {
            // Find user
            const user = await database_1.default.user.findUnique({
                where: { email }
            });
            if (!user || !user.password) {
                await (0, rateLimiter_middleware_1.incrementFailedLoginAttempts)(email, ipAddress);
                const error = new Error('Invalid email or password');
                error.statusCode = constants_1.HTTP_STATUS.UNAUTHORIZED;
                throw error;
            }
            // Verify password
            const isValidPassword = await bcryptjs_1.default.compare(password, user.password);
            if (!isValidPassword) {
                await (0, rateLimiter_middleware_1.incrementFailedLoginAttempts)(email, ipAddress);
                const error = new Error('Invalid email or password');
                error.statusCode = constants_1.HTTP_STATUS.UNAUTHORIZED;
                throw error;
            }
            // Clear failed login attempts
            await (0, rateLimiter_middleware_1.clearFailedLoginAttempts)(email, ipAddress);
            // Generate tokens
            const accessToken = this.generateAccessToken(user);
            const refreshToken = this.generateRefreshToken(user);
            // Cache user session
            await (0, redis_1.setCache)(`${constants_1.CACHE_KEYS.USER_SESSION}${user.id}`, { userId: user.id, email: user.email, role: user.role }, constants_1.CACHE_TTL.USER_SESSION);
            const { password: _, ...userWithoutPassword } = user;
            return {
                user: userWithoutPassword,
                accessToken,
                refreshToken
            };
        }
        catch (error) {
            if (!error.statusCode) {
                await (0, rateLimiter_middleware_1.incrementFailedLoginAttempts)(email, ipAddress);
            }
            throw error;
        }
    }
    async refreshToken(refreshToken) {
        try {
            const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
            const user = await database_1.default.user.findUnique({
                where: { id: decoded.userId }
            });
            if (!user) {
                const error = new Error('User not found');
                error.statusCode = constants_1.HTTP_STATUS.UNAUTHORIZED;
                throw error;
            }
            const newAccessToken = this.generateAccessToken(user);
            const newRefreshToken = this.generateRefreshToken(user);
            return {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            };
        }
        catch (error) {
            const authError = new Error('Invalid refresh token');
            authError.statusCode = constants_1.HTTP_STATUS.UNAUTHORIZED;
            throw authError;
        }
    }
    async logout(userId) {
        await (0, redis_1.deleteCache)(`${constants_1.CACHE_KEYS.USER_SESSION}${userId}`);
    }
    async verifyEmail(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            const user = await database_1.default.user.findUnique({
                where: { id: decoded.userId }
            });
            if (!user) {
                const error = new Error('User not found');
                error.statusCode = constants_1.HTTP_STATUS.NOT_FOUND;
                throw error;
            }
            if (user.emailVerified) {
                const error = new Error('Email already verified');
                error.statusCode = constants_1.HTTP_STATUS.CONFLICT;
                throw error;
            }
            await database_1.default.user.update({
                where: { id: user.id },
                data: { emailVerified: true }
            });
            // Send welcome email
            await this.emailService.sendWelcomeEmail(user.email, user.firstName);
        }
        catch (error) {
            if (!error.statusCode) {
                const verificationError = new Error('Invalid or expired verification token');
                verificationError.statusCode = constants_1.HTTP_STATUS.BAD_REQUEST;
                throw verificationError;
            }
            throw error;
        }
    }
    async forgotPassword(email) {
        const user = await database_1.default.user.findUnique({
            where: { email }
        });
        if (!user) {
            // Don't reveal if user exists or not
            return;
        }
        const resetToken = this.generatePasswordResetToken(user.id, user.email);
        await this.emailService.sendPasswordReset(user.email, user.firstName, resetToken);
    }
    async resetPassword(token, newPassword) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            const user = await database_1.default.user.findUnique({
                where: { id: decoded.userId }
            });
            if (!user) {
                const error = new Error('User not found');
                error.statusCode = constants_1.HTTP_STATUS.NOT_FOUND;
                throw error;
            }
            const hashedPassword = await bcryptjs_1.default.hash(newPassword, 12);
            await database_1.default.user.update({
                where: { id: user.id },
                data: { password: hashedPassword }
            });
            // Clear all user sessions
            await (0, redis_1.deleteCache)(`${constants_1.CACHE_KEYS.USER_SESSION}${user.id}`);
        }
        catch (error) {
            if (!error.statusCode) {
                const resetError = new Error('Invalid or expired reset token');
                resetError.statusCode = constants_1.HTTP_STATUS.BAD_REQUEST;
                throw resetError;
            }
            throw error;
        }
    }
    generateAccessToken(user) {
        return jsonwebtoken_1.default.sign({
            userId: user.id,
            email: user.email,
            role: user.role
        }, process.env.JWT_SECRET, { expiresIn: constants_1.JWT_CONFIG.ACCESS_TOKEN_EXPIRY });
    }
    generateRefreshToken(user) {
        return jsonwebtoken_1.default.sign({
            userId: user.id,
            email: user.email
        }, process.env.JWT_REFRESH_SECRET, { expiresIn: constants_1.JWT_CONFIG.REFRESH_TOKEN_EXPIRY });
    }
    generateEmailVerificationToken(userId, email) {
        return jsonwebtoken_1.default.sign({ userId, email, type: 'email_verification' }, process.env.JWT_SECRET, { expiresIn: constants_1.JWT_CONFIG.EMAIL_VERIFICATION_EXPIRY });
    }
    generatePasswordResetToken(userId, email) {
        return jsonwebtoken_1.default.sign({ userId, email, type: 'password_reset' }, process.env.JWT_SECRET, { expiresIn: constants_1.JWT_CONFIG.PASSWORD_RESET_EXPIRY });
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map