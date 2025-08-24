import { User, Role } from '@prisma/client';
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
export declare class AuthService {
    private emailService;
    constructor();
    register(userData: RegisterData): Promise<{
        user: Omit<User, 'password'>;
        message: string;
    }>;
    login(email: string, password: string, ipAddress: string, userAgent: string): Promise<LoginResponse>;
    refreshToken(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(userId: string): Promise<void>;
    verifyEmail(token: string): Promise<void>;
    forgotPassword(email: string): Promise<void>;
    resetPassword(token: string, newPassword: string): Promise<void>;
    private generateAccessToken;
    private generateRefreshToken;
    private generateEmailVerificationToken;
    private generatePasswordResetToken;
}
export {};
//# sourceMappingURL=auth.service.d.ts.map