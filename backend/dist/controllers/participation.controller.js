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