import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { ParticipationController } from '../controllers/participation.controller';
import { AdminController } from '../controllers/admin.controller';
import { EmployeeController } from '../controllers/employee.controller';

// Middlewares
import { 
  authenticateToken, 
  requireEmailVerification, 
  requireAdmin, 
  requireEmployee,
  requireClient 
} from '../middlewares/auth.middleware';
import {
  validateRegistration,
  validateLogin,
  validateParticipation,
  validateEmailVerification,
  validateForgotPassword,
  validateResetPassword,
  validateRefreshToken,
  validatePagination,
  validateCreateGain,
  validateGenerateCodes,
  validateUUID
} from '../middlewares/validation.middleware';
import {
  generalLimiter,
  authLimiter,
  participationLimiter,
  loginAttemptLimiter,
  emailVerificationLimiter,
  passwordResetLimiter
} from '../middlewares/rateLimiter.middleware';

const router = Router();

// Initialize controllers
const authController = new AuthController();
const participationController = new ParticipationController();
const adminController = new AdminController();
const employeeController = new EmployeeController();

// Apply general rate limiting to all routes
router.use(generalLimiter);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// ==================== AUTH ROUTES ====================
const authRoutes = Router();

// Public auth routes
authRoutes.post('/register', authLimiter, validateRegistration, authController.register);
authRoutes.post('/login', authLimiter, loginAttemptLimiter, validateLogin, authController.login);
authRoutes.post('/refresh-token', authLimiter, validateRefreshToken, authController.refreshToken);
authRoutes.get('/verify-email/:token', validateEmailVerification, authController.verifyEmail);
authRoutes.post('/forgot-password', passwordResetLimiter, validateForgotPassword, authController.forgotPassword);
authRoutes.post('/reset-password/:token', validateResetPassword, authController.resetPassword);

// Protected auth routes
authRoutes.post('/logout', authenticateToken, authController.logout);

router.use('/auth', authRoutes);

// ==================== PARTICIPATION ROUTES ====================
const participationRoutes = Router();

// All participation routes require authentication and email verification
participationRoutes.use(authenticateToken, requireEmailVerification, requireClient);

// Validate code before showing wheel (secure endpoint)
participationRoutes.post('/validate-code', participationLimiter, validateParticipation, participationController.validateCode);
participationRoutes.post('/', participationLimiter, validateParticipation, participationController.participate);
participationRoutes.get('/my-participations', validatePagination, participationController.getMyParticipations);
participationRoutes.get('/stats', participationController.getParticipationStats);

router.use('/participation', participationRoutes);

// ==================== ADMIN ROUTES ====================
const adminRoutes = Router();

// All admin routes require authentication, email verification, and admin role
adminRoutes.use(authenticateToken, requireEmailVerification, requireAdmin);

// Dashboard and stats
adminRoutes.get('/dashboard/stats', adminController.getDashboardStats);
adminRoutes.get('/participations', validatePagination, adminController.getAllParticipations);
adminRoutes.get('/users', validatePagination, adminController.getAllUsers);

// Gain management
adminRoutes.post('/gains', validateCreateGain, adminController.createGain);
adminRoutes.put('/gains/:id', validateUUID, validateCreateGain, adminController.updateGain);

// Code generation
adminRoutes.post('/codes/generate', validateGenerateCodes, adminController.generateCodes);

router.use('/admin', adminRoutes);

// ==================== EMPLOYEE ROUTES ====================
const employeeRoutes = Router();

// All employee routes require authentication, email verification, and employee/admin role
employeeRoutes.use(authenticateToken, requireEmailVerification, requireEmployee);

// Prize management
employeeRoutes.get('/prizes/unclaimed', validatePagination, employeeController.getUnclaimedPrizes);
employeeRoutes.get('/prizes/claimed', validatePagination, employeeController.getClaimedPrizes);
employeeRoutes.post('/prizes/:participationId/claim', validateUUID, employeeController.claimPrize);

// Employee stats
employeeRoutes.get('/stats', employeeController.getEmployeeStats);

router.use('/employee', employeeRoutes);

// ==================== PUBLIC ROUTES ====================
// These routes don't require authentication

// Get available gains (for display on frontend)
router.get('/gains', async (req, res) => {
  try {
    const { GainService } = await import('../services/gain.service');
    const gainService = new GainService();
    const gains = await gainService.getAvailableGains();
    
    res.json({
      success: true,
      message: 'Available gains retrieved successfully',
      data: gains
    });
  } catch (error: any) {
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

export default router;
