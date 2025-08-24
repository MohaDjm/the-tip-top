"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeController = void 0;
const constants_1 = require("../config/constants");
const logger_1 = require("../utils/logger");
const database_1 = __importDefault(require("../config/database"));
class EmployeeController {
    claimPrize = async (req, res) => {
        try {
            const { participationId } = req.params;
            const employeeId = req.user?.id;
            if (!employeeId) {
                return res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: 'Employee not authenticated'
                });
            }
            const participation = await database_1.default.participation.findUnique({
                where: { id: participationId },
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            firstName: true,
                            lastName: true
                        }
                    },
                    gain: true
                }
            });
            if (!participation) {
                return res.status(constants_1.HTTP_STATUS.NOT_FOUND).json({
                    success: false,
                    message: 'Participation not found'
                });
            }
            if (participation.isClaimed) {
                return res.status(constants_1.HTTP_STATUS.CONFLICT).json({
                    success: false,
                    message: 'Prize already claimed'
                });
            }
            const updatedParticipation = await database_1.default.participation.update({
                where: { id: participationId },
                data: {
                    isClaimed: true,
                    claimedAt: new Date(),
                    claimedByEmployeeId: employeeId
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
                    gain: true
                }
            });
            res.status(constants_1.HTTP_STATUS.OK).json({
                success: true,
                message: 'Prize claimed successfully',
                data: updatedParticipation
            });
        }
        catch (error) {
            logger_1.logger.error('Claim prize error:', error);
            res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'Failed to claim prize'
            });
        }
    };
    getUnclaimedPrizes = async (req, res) => {
        try {
            const { page = 1, limit = 20, gainId } = req.query;
            const participations = await database_1.default.participation.findMany({
                where: {
                    isClaimed: false,
                    ...(gainId && { gainId: gainId })
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            firstName: true,
                            lastName: true,
                            phone: true
                        }
                    },
                    gain: true,
                    code: {
                        select: {
                            code: true
                        }
                    }
                },
                orderBy: { participationDate: 'desc' },
                skip: (parseInt(page) - 1) * parseInt(limit),
                take: parseInt(limit)
            });
            const total = await database_1.default.participation.count({
                where: {
                    isClaimed: false,
                    ...(gainId && { gainId: gainId })
                }
            });
            res.status(constants_1.HTTP_STATUS.OK).json({
                success: true,
                message: 'Unclaimed prizes retrieved successfully',
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
            logger_1.logger.error('Get unclaimed prizes error:', error);
            res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'Failed to retrieve unclaimed prizes'
            });
        }
    };
    getClaimedPrizes = async (req, res) => {
        try {
            const { page = 1, limit = 20, gainId } = req.query;
            const employeeId = req.user?.id;
            const participations = await database_1.default.participation.findMany({
                where: {
                    isClaimed: true,
                    ...(gainId && { gainId: gainId }),
                    ...(employeeId && { claimedByEmployeeId: employeeId })
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            firstName: true,
                            lastName: true,
                            phone: true
                        }
                    },
                    gain: true,
                    code: {
                        select: {
                            code: true
                        }
                    }
                },
                orderBy: { claimedAt: 'desc' },
                skip: (parseInt(page) - 1) * parseInt(limit),
                take: parseInt(limit)
            });
            const total = await database_1.default.participation.count({
                where: {
                    isClaimed: true,
                    ...(gainId && { gainId: gainId }),
                    ...(employeeId && { claimedByEmployeeId: employeeId })
                }
            });
            res.status(constants_1.HTTP_STATUS.OK).json({
                success: true,
                message: 'Claimed prizes retrieved successfully',
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
            logger_1.logger.error('Get claimed prizes error:', error);
            res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'Failed to retrieve claimed prizes'
            });
        }
    };
    getEmployeeStats = async (req, res) => {
        try {
            const employeeId = req.user?.id;
            if (!employeeId) {
                return res.status(constants_1.HTTP_STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: 'Employee not authenticated'
                });
            }
            const [totalClaimed, todayClaimed, thisWeekClaimed] = await Promise.all([
                database_1.default.participation.count({
                    where: {
                        claimedByEmployeeId: employeeId,
                        isClaimed: true
                    }
                }),
                database_1.default.participation.count({
                    where: {
                        claimedByEmployeeId: employeeId,
                        isClaimed: true,
                        claimedAt: {
                            gte: new Date(new Date().setHours(0, 0, 0, 0))
                        }
                    }
                }),
                database_1.default.participation.count({
                    where: {
                        claimedByEmployeeId: employeeId,
                        isClaimed: true,
                        claimedAt: {
                            gte: new Date(new Date().setDate(new Date().getDate() - 7))
                        }
                    }
                })
            ]);
            res.status(constants_1.HTTP_STATUS.OK).json({
                success: true,
                message: 'Employee stats retrieved successfully',
                data: {
                    totalClaimed,
                    todayClaimed,
                    thisWeekClaimed
                }
            });
        }
        catch (error) {
            logger_1.logger.error('Get employee stats error:', error);
            res.status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'Failed to retrieve employee stats'
            });
        }
    };
}
exports.EmployeeController = EmployeeController;
//# sourceMappingURL=employee.controller.js.map