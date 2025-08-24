"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const constants_1 = require("../config/constants");
const logger_1 = require("../utils/logger");
class AuthController {
    authService;
    constructor() {
        this.authService = new auth_service_1.AuthService();
    }
    register = async (req, res) => {
        try {
            const userData = req.body;
            const result = await this.authService.register(userData);
            res.status(constants_1.HTTP_STATUS.CREATED).json({
                success: true,
                message: 'User registered successfully',
                data: result
            });
        }
        catch (error) {
            logger_1.logger.error('Registration error:', error);
            res.status(error.statusCode || constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message || 'Registration failed'
            });
        }
    };
    login = async (req, res) => {
        try {
            const { email, password } = req.body;
            const result = await this.authService.login(email, password, req.ip || '', req.get('User-Agent') || '');
            res.status(constants_1.HTTP_STATUS.OK).json({
                success: true,
                message: 'Login successful',
                data: result
            });
        }
        catch (error) {
            logger_1.logger.error('Login error:', error);
            res.status(error.statusCode || constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message || 'Login failed'
            });
        }
    };
    refreshToken = async (req, res) => {
        try {
            const { refreshToken } = req.body;
            const result = await this.authService.refreshToken(refreshToken);
            res.status(constants_1.HTTP_STATUS.OK).json({
                success: true,
                message: 'Token refreshed successfully',
                data: result
            });
        }
        catch (error) {
            logger_1.logger.error('Token refresh error:', error);
            res.status(error.statusCode || constants_1.HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: error.message || 'Token refresh failed'
            });
        }
    };
    logout = async (req, res) => {
        try {
            const userId = req.user?.id;
            if (userId) {
                await this.authService.logout(userId);
            }
            res.status(constants_1.HTTP_STATUS.OK).json({
                success: true,
                message: 'Logout successful'
            });
        }
        catch (error) {
            logger_1.logger.error('Logout error:', error);
            res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'Logout failed'
            });
        }
    };
    verifyEmail = async (req, res) => {
        try {
            const { token } = req.params;
            await this.authService.verifyEmail(token);
            res.status(constants_1.HTTP_STATUS.OK).json({
                success: true,
                message: 'Email verified successfully'
            });
        }
        catch (error) {
            logger_1.logger.error('Email verification error:', error);
            res.status(error.statusCode || constants_1.HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: error.message || 'Email verification failed'
            });
        }
    };
    forgotPassword = async (req, res) => {
        try {
            const { email } = req.body;
            await this.authService.forgotPassword(email);
            res.status(constants_1.HTTP_STATUS.OK).json({
                success: true,
                message: 'Password reset email sent'
            });
        }
        catch (error) {
            logger_1.logger.error('Forgot password error:', error);
            res.status(error.statusCode || constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message || 'Password reset failed'
            });
        }
    };
    resetPassword = async (req, res) => {
        try {
            const { token } = req.params;
            const { password } = req.body;
            await this.authService.resetPassword(token, password);
            res.status(constants_1.HTTP_STATUS.OK).json({
                success: true,
                message: 'Password reset successfully'
            });
        }
        catch (error) {
            logger_1.logger.error('Password reset error:', error);
            res.status(error.statusCode || constants_1.HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: error.message || 'Password reset failed'
            });
        }
    };
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map