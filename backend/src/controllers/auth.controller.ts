import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { HTTP_STATUS } from '../config/constants';
import { logger } from '../utils/logger';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = async (req: Request, res: Response) => {
    try {
      const userData = req.body;
      const result = await this.authService.register(userData);
      
      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'User registered successfully',
        data: result
      });
    } catch (error: any) {
      logger.error('Registration error:', error);
      res.status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || 'Registration failed'
      });
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const result = await this.authService.login(email, password, req.ip, req.get('User-Agent') || '');
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (error: any) {
      logger.error('Login error:', error);
      res.status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || 'Login failed'
      });
    }
  };

  refreshToken = async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body;
      const result = await this.authService.refreshToken(refreshToken);
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Token refreshed successfully',
        data: result
      });
    } catch (error: any) {
      logger.error('Token refresh error:', error);
      res.status(error.statusCode || HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: error.message || 'Token refresh failed'
      });
    }
  };

  logout = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (userId) {
        await this.authService.logout(userId);
      }
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error: any) {
      logger.error('Logout error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Logout failed'
      });
    }
  };

  verifyEmail = async (req: Request, res: Response) => {
    try {
      const { token } = req.params;
      await this.authService.verifyEmail(token);
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Email verified successfully'
      });
    } catch (error: any) {
      logger.error('Email verification error:', error);
      res.status(error.statusCode || HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: error.message || 'Email verification failed'
      });
    }
  };

  forgotPassword = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      await this.authService.forgotPassword(email);
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Password reset email sent'
      });
    } catch (error: any) {
      logger.error('Forgot password error:', error);
      res.status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || 'Password reset failed'
      });
    }
  };

  resetPassword = async (req: Request, res: Response) => {
    try {
      const { token } = req.params;
      const { password } = req.body;
      await this.authService.resetPassword(token, password);
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Password reset successfully'
      });
    } catch (error: any) {
      logger.error('Password reset error:', error);
      res.status(error.statusCode || HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: error.message || 'Password reset failed'
      });
    }
  };
}
