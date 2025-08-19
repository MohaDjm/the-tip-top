export const JWT_CONFIG = {
  ACCESS_TOKEN_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY: '7d',
  EMAIL_VERIFICATION_EXPIRY: '24h',
  PASSWORD_RESET_EXPIRY: '1h',
};

export const RATE_LIMITS = {
  LOGIN_ATTEMPTS: 5,
  LOGIN_WINDOW: 15 * 60 * 1000, // 15 minutes
  PARTICIPATION_PER_DAY: 1,
  EMAIL_VERIFICATION_ATTEMPTS: 3,
  PASSWORD_RESET_ATTEMPTS: 3,
};

export const CACHE_KEYS = {
  USER_SESSION: 'user_session:',
  PARTICIPATION_LIMIT: 'participation_limit:',
  FAILED_LOGIN_ATTEMPTS: 'failed_login:',
  EMAIL_VERIFICATION: 'email_verification:',
  PASSWORD_RESET: 'password_reset:',
};

export const CACHE_TTL = {
  USER_SESSION: 15 * 60, // 15 minutes
  PARTICIPATION_LIMIT: 24 * 60 * 60, // 24 hours
  FAILED_LOGIN_ATTEMPTS: 15 * 60, // 15 minutes
  EMAIL_VERIFICATION: 24 * 60 * 60, // 24 hours
  PASSWORD_RESET: 60 * 60, // 1 hour
};

export const ROLES = {
  CLIENT: 'CLIENT',
  EMPLOYEE: 'EMPLOYEE',
  ADMIN: 'ADMIN',
} as const;

export const GAIN_TYPES = {
  INFUSEUR: 'Infuseur à thé',
  THE_DETOX: 'Thé détox ou infusion',
  THE_SIGNATURE: 'Thé signature',
  COFFRET_DECOUVERTE: 'Coffret découverte',
  COFFRET_PREMIUM: 'Coffret premium',
} as const;

export const EMAIL_TEMPLATES = {
  WELCOME: 'welcome',
  EMAIL_VERIFICATION: 'email-verification',
  PASSWORD_RESET: 'password-reset',
  PARTICIPATION_CONFIRMATION: 'participation-confirmation',
  PRIZE_WON: 'prize-won',
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;
