import { Request, Response, NextFunction } from 'express';
export declare const generalLimiter: import("express-rate-limit").RateLimitRequestHandler;
export declare const authLimiter: import("express-rate-limit").RateLimitRequestHandler;
export declare const participationLimiter: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const loginAttemptLimiter: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const incrementFailedLoginAttempts: (email: string, ip: string) => Promise<void>;
export declare const clearFailedLoginAttempts: (email: string, ip: string) => Promise<void>;
export declare const emailVerificationLimiter: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const passwordResetLimiter: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=rateLimiter.middleware.d.ts.map