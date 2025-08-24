"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const participation_controller_1 = require("../controllers/participation.controller");
const admin_controller_1 = require("../controllers/admin.controller");
const employee_controller_1 = require("../controllers/employee.controller");
// Middlewares
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const rateLimiter_middleware_1 = require("../middlewares/rateLimiter.middleware");
const router = (0, express_1.Router)();
// Initialize controllers
const authController = new auth_controller_1.AuthController();
const participationController = new participation_controller_1.ParticipationController();
const adminController = new admin_controller_1.AdminController();
const employeeController = new employee_controller_1.EmployeeController();
// Apply general rate limiting to all routes
router.use(rateLimiter_middleware_1.generalLimiter);
// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'API is running',
        timestamp: new Date().toISOString()
    });
});
// ==================== AUTH ROUTES ====================
const authRoutes = (0, express_1.Router)();
// Public auth routes
authRoutes.post('/register', rateLimiter_middleware_1.authLimiter, validation_middleware_1.validateRegistration, authController.register);
authRoutes.post('/login', rateLimiter_middleware_1.authLimiter, rateLimiter_middleware_1.loginAttemptLimiter, validation_middleware_1.validateLogin, authController.login);
authRoutes.post('/refresh-token', rateLimiter_middleware_1.authLimiter, validation_middleware_1.validateRefreshToken, authController.refreshToken);
authRoutes.get('/verify-email/:token', validation_middleware_1.validateEmailVerification, authController.verifyEmail);
authRoutes.post('/forgot-password', rateLimiter_middleware_1.passwordResetLimiter, validation_middleware_1.validateForgotPassword, authController.forgotPassword);
authRoutes.post('/reset-password/:token', validation_middleware_1.validateResetPassword, authController.resetPassword);
// Protected auth routes
authRoutes.post('/logout', auth_middleware_1.authenticateToken, authController.logout);
router.use('/auth', authRoutes);
// ==================== PARTICIPATION ROUTES ====================
const participationRoutes = (0, express_1.Router)();
// All participation routes require authentication and email verification
participationRoutes.use(auth_middleware_1.authenticateToken, auth_middleware_1.requireEmailVerification, auth_middleware_1.requireClient);
participationRoutes.post('/', rateLimiter_middleware_1.participationLimiter, validation_middleware_1.validateParticipation, participationController.participate);
participationRoutes.get('/my-participations', validation_middleware_1.validatePagination, participationController.getMyParticipations);
participationRoutes.get('/stats', participationController.getParticipationStats);
router.use('/participation', participationRoutes);
// ==================== ADMIN ROUTES ====================
const adminRoutes = (0, express_1.Router)();
// All admin routes require authentication, email verification, and admin role
adminRoutes.use(auth_middleware_1.authenticateToken, auth_middleware_1.requireEmailVerification, auth_middleware_1.requireAdmin);
// Dashboard and stats
adminRoutes.get('/dashboard/stats', adminController.getDashboardStats);
adminRoutes.get('/participations', validation_middleware_1.validatePagination, adminController.getAllParticipations);
adminRoutes.get('/users', validation_middleware_1.validatePagination, adminController.getAllUsers);
// Gain management
adminRoutes.post('/gains', validation_middleware_1.validateCreateGain, adminController.createGain);
adminRoutes.put('/gains/:id', validation_middleware_1.validateUUID, validation_middleware_1.validateCreateGain, adminController.updateGain);
// Code generation
adminRoutes.post('/codes/generate', validation_middleware_1.validateGenerateCodes, adminController.generateCodes);
router.use('/admin', adminRoutes);
// ==================== EMPLOYEE ROUTES ====================
const employeeRoutes = (0, express_1.Router)();
// All employee routes require authentication, email verification, and employee/admin role
employeeRoutes.use(auth_middleware_1.authenticateToken, auth_middleware_1.requireEmailVerification, auth_middleware_1.requireEmployee);
// Prize management
employeeRoutes.get('/prizes/unclaimed', validation_middleware_1.validatePagination, employeeController.getUnclaimedPrizes);
employeeRoutes.get('/prizes/claimed', validation_middleware_1.validatePagination, employeeController.getClaimedPrizes);
employeeRoutes.post('/prizes/:participationId/claim', validation_middleware_1.validateUUID, employeeController.claimPrize);
// Employee stats
employeeRoutes.get('/stats', employeeController.getEmployeeStats);
router.use('/employee', employeeRoutes);
// ==================== PUBLIC ROUTES ====================
// These routes don't require authentication
// Get available gains (for display on frontend)
router.get('/gains', async (req, res) => {
    try {
        const { GainService } = await Promise.resolve().then(() => __importStar(require('../services/gain.service')));
        const gainService = new GainService();
        const gains = await gainService.getAvailableGains();
        res.json({
            success: true,
            message: 'Available gains retrieved successfully',
            data: gains
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve gains'
        });
    }
});
// ==================== ERROR HANDLING ====================
// 404 handler for undefined routes
router.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});
exports.default = router;
//# sourceMappingURL=index.js.map