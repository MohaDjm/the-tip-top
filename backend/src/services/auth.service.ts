import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Role } from '@prisma/client';
import prisma from '../config/database';
import { EmailService } from './email.service';
import { setCache, deleteCache } from '../config/redis';
import { JWT_CONFIG, HTTP_STATUS, CACHE_KEYS, CACHE_TTL } from '../config/constants';
import { incrementFailedLoginAttempts, clearFailedLoginAttempts } from '../middlewares/rateLimiter.middleware';

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  role?: Role;
}

interface LoginResponse {
  user: Omit<User, 'password'>;
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
  }

  async register(userData: RegisterData): Promise<{ user: Omit<User, 'password'>; message: string }> {
    const { email, password, ...otherData } = userData;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      const error = new Error('User already exists with this email');
      (error as any).statusCode = HTTP_STATUS.CONFLICT;
      throw error;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        ...otherData,
        role: userData.role || Role.CLIENT
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

  async login(email: string, password: string, ipAddress: string, userAgent: string): Promise<LoginResponse> {
    try {
      // Find user
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user || !user.password) {
        await incrementFailedLoginAttempts(email, ipAddress);
        const error = new Error('Invalid email or password');
        (error as any).statusCode = HTTP_STATUS.UNAUTHORIZED;
        throw error;
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        await incrementFailedLoginAttempts(email, ipAddress);
        const error = new Error('Invalid email or password');
        (error as any).statusCode = HTTP_STATUS.UNAUTHORIZED;
        throw error;
      }

      // Clear failed login attempts
      await clearFailedLoginAttempts(email, ipAddress);

      // Generate tokens
      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);

      // Cache user session
      await setCache(
        `${CACHE_KEYS.USER_SESSION}${user.id}`,
        { userId: user.id, email: user.email, role: user.role },
        CACHE_TTL.USER_SESSION
      );

      const { password: _, ...userWithoutPassword } = user;
      return {
        user: userWithoutPassword,
        accessToken,
        refreshToken
      };
    } catch (error) {
      if (!(error as any).statusCode) {
        await incrementFailedLoginAttempts(email, ipAddress);
      }
      throw error;
    }
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any;
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });

      if (!user) {
        const error = new Error('User not found');
        (error as any).statusCode = HTTP_STATUS.UNAUTHORIZED;
        throw error;
      }

      const newAccessToken = this.generateAccessToken(user);
      const newRefreshToken = this.generateRefreshToken(user);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      };
    } catch (error) {
      const authError = new Error('Invalid refresh token');
      (authError as any).statusCode = HTTP_STATUS.UNAUTHORIZED;
      throw authError;
    }
  }

  async logout(userId: string): Promise<void> {
    await deleteCache(`${CACHE_KEYS.USER_SESSION}${userId}`);
  }

  async verifyEmail(token: string): Promise<void> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });

      if (!user) {
        const error = new Error('User not found');
        (error as any).statusCode = HTTP_STATUS.NOT_FOUND;
        throw error;
      }

      if (user.emailVerified) {
        const error = new Error('Email already verified');
        (error as any).statusCode = HTTP_STATUS.CONFLICT;
        throw error;
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true }
      });

      // Send welcome email
      await this.emailService.sendWelcomeEmail(user.email, user.firstName);
    } catch (error) {
      if (!(error as any).statusCode) {
        const verificationError = new Error('Invalid or expired verification token');
        (verificationError as any).statusCode = HTTP_STATUS.BAD_REQUEST;
        throw verificationError;
      }
      throw error;
    }
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Don't reveal if user exists or not
      return;
    }

    const resetToken = this.generatePasswordResetToken(user.id, user.email);
    await this.emailService.sendPasswordReset(user.email, user.firstName, resetToken);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });

      if (!user) {
        const error = new Error('User not found');
        (error as any).statusCode = HTTP_STATUS.NOT_FOUND;
        throw error;
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);

      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      });

      // Clear all user sessions
      await deleteCache(`${CACHE_KEYS.USER_SESSION}${user.id}`);
    } catch (error) {
      if (!(error as any).statusCode) {
        const resetError = new Error('Invalid or expired reset token');
        (resetError as any).statusCode = HTTP_STATUS.BAD_REQUEST;
        throw resetError;
      }
      throw error;
    }
  }

  private generateAccessToken(user: User): string {
    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET!,
      { expiresIn: JWT_CONFIG.ACCESS_TOKEN_EXPIRY }
    );
  }

  private generateRefreshToken(user: User): string {
    return jwt.sign(
      {
        userId: user.id,
        email: user.email
      },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: JWT_CONFIG.REFRESH_TOKEN_EXPIRY }
    );
  }

  private generateEmailVerificationToken(userId: string, email: string): string {
    return jwt.sign(
      { userId, email, type: 'email_verification' },
      process.env.JWT_SECRET!,
      { expiresIn: JWT_CONFIG.EMAIL_VERIFICATION_EXPIRY }
    );
  }

  private generatePasswordResetToken(userId: string, email: string): string {
    return jwt.sign(
      { userId, email, type: 'password_reset' },
      process.env.JWT_SECRET!,
      { expiresIn: JWT_CONFIG.PASSWORD_RESET_EXPIRY }
    );
  }
}
