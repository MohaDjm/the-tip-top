import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { HTTP_STATUS } from '../config/constants';

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

export const validateRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('dateOfBirth')
    .isISO8601()
    .toDate()
    .withMessage('Valid date of birth is required'),
  body('phone')
    .isMobilePhone('fr-FR')
    .withMessage('Valid French phone number is required'),
  body('address')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Address must be between 5 and 200 characters'),
  body('city')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be between 2 and 100 characters'),
  body('postalCode')
    .matches(/^\d{5}$/)
    .withMessage('Valid French postal code is required'),
  handleValidationErrors
];

export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

export const validateParticipation = [
  body('code')
    .trim()
    .isLength({ min: 10, max: 10 })
    .isAlphanumeric()
    .withMessage('Code must be exactly 10 alphanumeric characters'),
  handleValidationErrors
];

export const validateEmailVerification = [
  param('token')
    .isJWT()
    .withMessage('Valid verification token is required'),
  handleValidationErrors
];

export const validateForgotPassword = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  handleValidationErrors
];

export const validateResetPassword = [
  param('token')
    .isJWT()
    .withMessage('Valid reset token is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  handleValidationErrors
];

export const validateRefreshToken = [
  body('refreshToken')
    .isJWT()
    .withMessage('Valid refresh token is required'),
  handleValidationErrors
];

export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

export const validateCreateGain = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Gain name must be between 3 and 100 characters'),
  body('value')
    .isDecimal({ decimal_digits: '0,2' })
    .withMessage('Value must be a decimal number with up to 2 decimal places'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  handleValidationErrors
];

export const validateGenerateCodes = [
  body('gainId')
    .isUUID()
    .withMessage('Valid gain ID is required'),
  body('quantity')
    .isInt({ min: 1, max: 10000 })
    .withMessage('Quantity must be between 1 and 10000'),
  handleValidationErrors
];

export const validateUUID = [
  param('id')
    .isUUID()
    .withMessage('Valid UUID is required'),
  handleValidationErrors
];
