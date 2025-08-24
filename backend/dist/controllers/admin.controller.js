"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const code_service_1 = require("../services/code.service");
const gain_service_1 = require("../services/gain.service");
const constants_1 = require("../config/constants");
const logger_1 = require("../utils/logger");
const database_1 = __importDefault(require("../config/database"));
class AdminController {
    codeService;
    gainService;
    constructor() {
        this.codeService = new code_service_1.CodeService();
        this.gainService = new gain_service_1.GainService();
    }
    getDashboardStats = async (req, res) => {
        try {
            const stats = await this.getSystemStats();
            res.status(constants_1.HTTP_STATUS.OK).json({
                success: true,
                message: 'Dashboard stats retrieved successfully',
                data: stats
            });
        }
        catch (error) {
            logger_1.logger.error('Get dashboard stats error:', error);
            res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'Failed to retrieve dashboard stats'
            });
        }
    };
    getAllParticipations = async (req, res) => {
        try {
            const { page = 1, limit = 20, status, gainId } = req.query;
            const participations = await database_1.default.participation.findMany({
                where: {
                    ...(status && { isClaimed: status === 'claimed' }),
                    ...(gainId && { gainId: gainId })
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            firstName: true,
                            lastName: true
                        }
                    },
                    gain: true,
                    code: true
                },
                orderBy: { participationDate: 'desc' },
                skip: (parseInt(page) - 1) * parseInt(limit),
                take: parseInt(limit)
            });
            const total = await database_1.default.participation.count({
                where: {
                    ...(status && { isClaimed: status === 'claimed' }),
                    ...(gainId && { gainId: gainId })
                }
            });
            res.status(constants_1.HTTP_STATUS.OK).json({
                success: true,
                message: 'Participations retrieved successfully',
                data: {
                    participations,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total,
                        pages: Math.ceil(total / parseInt(limit))
                    }
                }
            });
        }
        catch (error) {
            logger_1.logger.error('Get all participations error:', error);
            res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'Failed to retrieve participations'
            });
        }
    };
    generateCodes = async (req, res) => {
        try {
            const { gainId, quantity } = req.body;
            const codes = await this.codeService.generateCodes(gainId, quantity);
            res.status(constants_1.HTTP_STATUS.CREATED).json({
                success: true,
                message: `${quantity} codes generated successfully`,
                data: { codes: codes.length }
            });
        }
        catch (error) {
            logger_1.logger.error('Generate codes error:', error);
            res.status(error.statusCode || constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message || 'Failed to generate codes'
            });
        }
    };
    createGain = async (req, res) => {
        try {
            const gainData = req.body;
            const gain = await this.gainService.createGain(gainData);
            res.status(constants_1.HTTP_STATUS.CREATED).json({
                success: true,
                message: 'Gain created successfully',
                data: gain
            });
        }
        catch (error) {
            logger_1.logger.error('Create gain error:', error);
            res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'Failed to create gain'
            });
        }
    };
    updateGain = async (req, res) => {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const gain = await this.gainService.updateGain(id, updateData);
            res.status(constants_1.HTTP_STATUS.OK).json({
                success: true,
                message: 'Gain updated successfully',
                data: gain
            });
        }
        catch (error) {
            logger_1.logger.error('Update gain error:', error);
            res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'Failed to update gain'
            });
        }
    };
    getAllUsers = async (req, res) => {
        try {
            const { page = 1, limit = 20, role } = req.query;
            const users = await database_1.default.user.findMany({
                where: {
                    ...(role && { role: role })
                },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                    emailVerified: true,
                    createdAt: true,
                    _count: {
                        select: {
                            participations: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip: (parseInt(page) - 1) * parseInt(limit),
                take: parseInt(limit)
            });
            const total = await database_1.default.user.count({
                where: {
                    ...(role && { role: role })
                }
            });
            res.status(constants_1.HTTP_STATUS.OK).json({
                success: true,
                message: 'Users retrieved successfully',
                data: {
                    users,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total,
                        pages: Math.ceil(total / parseInt(limit))
                    }
                }
            });
        }
        catch (error) {
            logger_1.logger.error('Get all users error:', error);
            res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'Failed to retrieve users'
            });
        }
    };
    async getSystemStats() {
        const [totalUsers, totalParticipations, totalCodes, usedCodes, claimedPrizes, totalGains] = await Promise.all([
            database_1.default.user.count(),
            database_1.default.participation.count(),
            database_1.default.code.count(),
            database_1.default.code.count({ where: { isUsed: true } }),
            database_1.default.participation.count({ where: { isClaimed: true } }),
            database_1.default.gain.count()
        ]);
        return {
            totalUsers,
            totalParticipations,
            totalCodes,
            usedCodes,
            availableCodes: totalCodes - usedCodes,
            claimedPrizes,
            unclaimedPrizes: totalParticipations - claimedPrizes,
            totalGains
        };
    }
}
exports.AdminController = AdminController;
//# sourceMappingURL=admin.controller.js.map