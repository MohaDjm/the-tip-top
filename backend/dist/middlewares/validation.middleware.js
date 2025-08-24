"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUUID = exports.validateGenerateCodes = exports.validateCreateGain = exports.validatePagination = exports.validateRefreshToken = exports.validateResetPassword = exports.validateForgotPassword = exports.validateEmailVerification = exports.validateParticipation = exports.validateLogin = exports.validateRegistration = exports.handleValidationErrors = void 0;
const express_validator_1 = require("express-validator");
const constants_1 = require("../config/constants");
const handleValidationErrors = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(constants_1.HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};
exports.handleValidationErrors = handleValidationErrors;
exports.validateRegistration = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Valid email is required'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    (0, express_validator_1.body)('firstName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('First name must be between 2 and 50 characters'),
    (0, express_validator_1.body)('lastName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Last name must be between 2 and 50 characters'),
    (0, express_validator_1.body)('dateOfBirth')
        .isISO8601()
        .toDate()
        .withMessage('Valid date of birth is required'),
    (0, express_validator_1.body)('phone')
        .isMobilePhone('fr-FR')
        .withMessage('Valid French phone number is required'),
    (0, express_validator_1.body)('address')
        .trim()
        .isLength({ min: 5, max: 200 })
        .withMessage('Address must be between 5 and 200 characters'),
    (0, express_validator_1.body)('city')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('City must be between 2 and 100 characters'),
    (0, express_validator_1.body)('postalCode')
        .matches(/^\d{5}$/)
        .withMessage('Valid French postal code is required'),
    exports.handleValidationErrors
];
exports.validateLogin = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Valid email is required'),
    (0, express_validator_1.body)('password')
        .notEmpty()
        .withMessage('Password is required'),
    exports.handleValidationErrors
];
exports.validateParticipation = [
    (0, express_validator_1.body)('code')
        .trim()
        .isLength({ min: 10, max: 10 })
        .isAlphanumeric()
        .withMessage('Code must be exactly 10 alphanumeric characters'),
    exports.handleValidationErrors
];
exports.validateEmailVerification = [
    (0, express_validator_1.param)('token')
        .isJWT()
        .withMessage('Valid verification token is required'),
    exports.handleValidationErrors
];
exports.validateForgotPassword = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Valid email is required'),
    exports.handleValidationErrors
];
exports.validateResetPassword = [
    (0, express_validator_1.param)('token')
        .isJWT()
        .withMessage('Valid reset token is required'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    exports.handleValidationErrors
];
exports.validateRefreshToken = [
    (0, express_validator_1.body)('refreshToken')
        .isJWT()
        .withMessage('Valid refresh token is required'),
    exports.handleValidationErrors
];
exports.validatePagination = [
    (0, express_validator_1.query)('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    (0, express_validator_1.query)('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    exports.handleValidationErrors
];
exports.validateCreateGain = [
    (0, express_validator_1.body)('name')
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('Gain name must be between 3 and 100 characters'),
    (0, express_validator_1.body)('value')
        .isDecimal({ decimal_digits: '0,2' })
        .withMessage('Value must be a decimal number with up to 2 decimal places'),
    (0, express_validator_1.body)('description')
        .trim()
        .isLength({ min: 10, max: 500 })
        .withMessage('Description must be between 10 and 500 characters'),
    (0, express_validator_1.body)('quantity')
        .isInt({ min: 1 })
        .withMessage('Quantity must be a positive integer'),
    exports.handleValidationErrors
];
exports.validateGenerateCodes = [
    (0, express_validator_1.body)('gainId')
        .isUUID()
        .withMessage('Valid gain ID is required'),
    (0, express_validator_1.body)('quantity')
        .isInt({ min: 1, max: 10000 })
        .withMessage('Quantity must be between 1 and 10000'),
    exports.handleValidationErrors
];
exports.validateUUID = [
    (0, express_validator_1.param)('id')
        .isUUID()
        .withMessage('Valid UUID is required'),
    exports.handleValidationErrors
];
//# sourceMappingURL=validation.middleware.js.map