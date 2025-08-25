"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParticipationController = void 0;
const code_service_1 = require("../services/code.service");
const constants_1 = require("../config/constants");
const logger_1 = require("../utils/logger");
class ParticipationController {
    codeService;
    constructor() {
        this.codeService = new code_service_1.CodeService();
    }
    // Validate code and return prize info (for wheel animation)
    validateCode = async (req, res) => {
        try {
            const { code } = req.body;
            const userId = req.user?.id;
            if (!userId) {
                return res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }
            const codeData = await this.codeService.getCodeByString(code);
            if (!codeData) {
                return res.status(constants_1.HTTP_STATUS.NOT_FOUND).json({
                    success: false,
                    message: 'Code invalide'
                });
            }
            if (codeData.isUsed) {
                return res.status(constants_1.HTTP_STATUS.CONFLICT).json({
                    success: false,
                    message: 'Ce code a déjà été utilisé'
                });
            }
            // Check daily participation limit
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const todayParticipation = await this.codeService.getUserTodayParticipation(userId, today, tomorrow);
            if (todayParticipation) {
                return res.status(constants_1.HTTP_STATUS.CONFLICT).json({
                    success: false,
                    message: 'Vous ne pouvez participer qu\'une fois par jour'
                });
            }
            res.status(constants_1.HTTP_STATUS.OK).json({
                success: true,
                message: 'Code valide',
                data: {
                    prize: codeData.gain.name,
                    prizeValue: codeData.gain.value,
                    prizeDescription: codeData.gain.description
                }
            });
        }
        catch (error) {
            logger_1.logger.error('Code validation error:', error);
            res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'Erreur lors de la validation du code'
            });
        }
    };
    participate = async (req, res) => {
        try {
            const { code } = req.body;
            const userId = req.user?.id;
            const ipAddress = req.ip;
            const userAgent = req.get('User-Agent') || '';
            if (!userId) {
                return res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }
            const result = await this.codeService.participateWithCode(userId, code, ipAddress || '', userAgent || '');
            res.status(constants_1.HTTP_STATUS.OK).json({
                success: true,
                message: 'Participation successful',
                data: result
            });
        }
        catch (error) {
            logger_1.logger.error('Participation error:', error);
            res.status(error.statusCode || constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message || 'Participation failed'
            });
        }
    };
    getMyParticipations = async (req, res) => {
        try {
            const userId = req.user?.id;
            const { page = 1, limit = 10 } = req.query;
            if (!userId) {
                return res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }
            const result = await this.codeService.getUserParticipations(userId, parseInt(page), parseInt(limit));
            res.status(constants_1.HTTP_STATUS.OK).json({
                success: true,
                message: 'Participations retrieved successfully',
                data: result
            });
        }
        catch (error) {
            logger_1.logger.error('Get participations error:', error);
            res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'Failed to retrieve participations'
            });
        }
    };
    getParticipationStats = async (req, res) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }
            const stats = await this.codeService.getUserParticipationStats(userId);
            res.status(constants_1.HTTP_STATUS.OK).json({
                success: true,
                message: 'Participation stats retrieved successfully',
                data: stats
            });
        }
        catch (error) {
            logger_1.logger.error('Get participation stats error:', error);
            res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'Failed to retrieve participation stats'
            });
        }
    };
}
exports.ParticipationController = ParticipationController;
//# sourceMappingURL=participation.controller.js.map