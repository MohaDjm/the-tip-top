"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeService = void 0;
const database_1 = __importDefault(require("../config/database"));
const codeGenerator_1 = require("../utils/codeGenerator");
const email_service_1 = require("./email.service");
const constants_1 = require("../config/constants");
const logger_1 = require("../utils/logger");
class CodeService {
    emailService;
    constructor() {
        this.emailService = new email_service_1.EmailService();
    }
    async generateCodes(gainId, quantity) {
        // Verify gain exists
        const gain = await database_1.default.gain.findUnique({
            where: { id: gainId }
        });
        if (!gain) {
            const error = new Error('Gain not found');
            error.statusCode = constants_1.HTTP_STATUS.NOT_FOUND;
            throw error;
        }
        const codes = [];
        const codeStrings = new Set();
        // Generate unique codes
        while (codeStrings.size < quantity) {
            const codeString = (0, codeGenerator_1.generateCode)();
            // Check if code already exists in database
            const existingCode = await database_1.default.code.findUnique({
                where: { code: codeString }
            });
            if (!existingCode) {
                codeStrings.add(codeString);
            }
        }
        // Create codes in database
        for (const codeString of codeStrings) {
            const code = await database_1.default.code.create({
                data: {
                    code: codeString,
                    gainId: gainId
                }
            });
            codes.push(code);
        }
        // Update gain quantities
        await database_1.default.gain.update({
            where: { id: gainId },
            data: {
                quantity: gain.quantity + quantity,
                remainingQuantity: gain.remainingQuantity + quantity
            }
        });
        logger_1.logger.info(`Generated ${quantity} codes for gain ${gain.name}`);
        return codes;
    }
    async participateWithCode(userId, codeString, ipAddress, userAgent) {
        // Check if code exists and is not used
        const code = await database_1.default.code.findUnique({
            where: { code: codeString },
            include: { gain: true }
        });
        if (!code) {
            const error = new Error('Invalid code');
            error.statusCode = constants_1.HTTP_STATUS.NOT_FOUND;
            throw error;
        }
        if (code.isUsed) {
            const error = new Error('Code has already been used');
            error.statusCode = constants_1.HTTP_STATUS.CONFLICT;
            throw error;
        }
        // Check if gain has remaining quantity
        if (code.gain.remainingQuantity <= 0) {
            const error = new Error('This prize is no longer available');
            error.statusCode = constants_1.HTTP_STATUS.CONFLICT;
            throw error;
        }
        // Check if user has already participated today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const todayParticipation = await database_1.default.participation.findFirst({
            where: {
                userId,
                participationDate: {
                    gte: today,
                    lt: tomorrow
                }
            }
        });
        if (todayParticipation) {
            const error = new Error('You can only participate once per day');
            error.statusCode = constants_1.HTTP_STATUS.CONFLICT;
            throw error;
        }
        // Create participation and mark code as used
        const participation = await database_1.default.$transaction(async (tx) => {
            // Mark code as used
            await tx.code.update({
                where: { id: code.id },
                data: { isUsed: true }
            });
            // Decrease remaining quantity
            await tx.gain.update({
                where: { id: code.gainId },
                data: {
                    remainingQuantity: {
                        decrement: 1
                    }
                }
            });
            // Create participation
            const newParticipation = await tx.participation.create({
                data: {
                    userId,
                    codeId: code.id,
                    gainId: code.gainId,
                    ipAddress,
                    userAgent
                },
                include: {
                    gain: true,
                    code: true,
                    user: {
                        select: {
                            email: true,
                            firstName: true,
                            lastName: true
                        }
                    }
                }
            });
            return newParticipation;
        });
        // Send confirmation email
        await this.emailService.sendParticipationConfirmation(participation.user.email, participation.user.firstName, participation.gain.name, participation.gain.description);
        logger_1.logger.info(`User ${userId} participated with code ${codeString} and won ${code.gain.name}`);
        return {
            participation,
            isWinner: true // In this lottery, every valid code is a winner
        };
    }
    async getUserParticipations(userId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [participations, total] = await Promise.all([
            database_1.default.participation.findMany({
                where: { userId },
                include: {
                    gain: true,
                    code: {
                        select: { code: true }
                    }
                },
                orderBy: { participationDate: 'desc' },
                skip,
                take: limit
            }),
            database_1.default.participation.count({
                where: { userId }
            })
        ]);
        return {
            participations,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }
    async getUserParticipationStats(userId) {
        const participations = await database_1.default.participation.findMany({
            where: { userId },
            include: { gain: true }
        });
        const totalParticipations = participations.length;
        const totalWins = participations.length; // Every participation is a win
        const totalValue = participations.reduce((sum, p) => sum + Number(p.gain.value), 0);
        const claimedPrizes = participations.filter(p => p.isClaimed).length;
        const unclaimedPrizes = participations.filter(p => !p.isClaimed).length;
        return {
            totalParticipations,
            totalWins,
            totalValue,
            claimedPrizes,
            unclaimedPrizes
        };
    }
    async getCodeByString(codeString) {
        return database_1.default.code.findUnique({
            where: { code: codeString },
            include: { gain: true }
        });
    }
    async getAllCodes(page = 1, limit = 20, gainId, isUsed) {
        const skip = (page - 1) * limit;
        const where = {};
        if (gainId)
            where.gainId = gainId;
        if (typeof isUsed === 'boolean')
            where.isUsed = isUsed;
        const [codes, total] = await Promise.all([
            database_1.default.code.findMany({
                where,
                include: { gain: true },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            database_1.default.code.count({ where })
        ]);
        return {
            codes,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }
}
exports.CodeService = CodeService;
//# sourceMappingURL=code.service.js.map