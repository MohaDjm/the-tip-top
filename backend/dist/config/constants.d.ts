export declare const JWT_CONFIG: {
    ACCESS_TOKEN_EXPIRY: string;
    REFRESH_TOKEN_EXPIRY: string;
    EMAIL_VERIFICATION_EXPIRY: string;
    PASSWORD_RESET_EXPIRY: string;
};
export declare const RATE_LIMITS: {
    LOGIN_ATTEMPTS: number;
    LOGIN_WINDOW: number;
    PARTICIPATION_PER_DAY: number;
    EMAIL_VERIFICATION_ATTEMPTS: number;
    PASSWORD_RESET_ATTEMPTS: number;
};
export declare const CACHE_KEYS: {
    USER_SESSION: string;
    PARTICIPATION_LIMIT: string;
    FAILED_LOGIN_ATTEMPTS: string;
    EMAIL_VERIFICATION: string;
    PASSWORD_RESET: string;
};
export declare const CACHE_TTL: {
    USER_SESSION: number;
    PARTICIPATION_LIMIT: number;
    FAILED_LOGIN_ATTEMPTS: number;
    EMAIL_VERIFICATION: number;
    PASSWORD_RESET: number;
};
export declare const ROLES: {
    readonly CLIENT: "CLIENT";
    readonly EMPLOYEE: "EMPLOYEE";
    readonly ADMIN: "ADMIN";
};
export declare const GAIN_TYPES: {
    readonly INFUSEUR: "Infuseur à thé";
    readonly THE_DETOX: "Thé détox ou infusion";
    readonly THE_SIGNATURE: "Thé signature";
    readonly COFFRET_DECOUVERTE: "Coffret découverte";
    readonly COFFRET_PREMIUM: "Coffret premium";
};
export declare const EMAIL_TEMPLATES: {
    readonly WELCOME: "welcome";
    readonly EMAIL_VERIFICATION: "email-verification";
    readonly PASSWORD_RESET: "password-reset";
    readonly PARTICIPATION_CONFIRMATION: "participation-confirmation";
    readonly PRIZE_WON: "prize-won";
};
export declare const HTTP_STATUS: {
    readonly OK: 200;
    readonly CREATED: 201;
    readonly BAD_REQUEST: 400;
    readonly UNAUTHORIZED: 401;
    readonly FORBIDDEN: 403;
    readonly NOT_FOUND: 404;
    readonly CONFLICT: 409;
    readonly TOO_MANY_REQUESTS: 429;
    readonly INTERNAL_SERVER_ERROR: 500;
};
//# sourceMappingURL=constants.d.ts.map