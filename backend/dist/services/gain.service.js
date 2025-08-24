"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GainService = void 0;
const database_1 = __importDefault(require("../config/database"));
const constants_1 = require("../config/constants");
class GainService {
    async createGain(gainData) {
        const gain = await database_1.default.gain.create({
            data: {
                ...gainData,
                remainingQuantity: gainData.quantity
            }
        });
        return gain;
    }
    async updateGain(gainId, updateData) {
        const existingGain = await database_1.default.gain.findUnique({
            where: { id: gainId }
        });
        if (!existingGain) {
            const error = new Error('Gain not found');
            error.statusCode = constants_1.HTTP_STATUS.NOT_FOUND;
            throw error;
        }
        // If quantity is being updated, adjust remaining quantity accordingly
        let adjustedData = { ...updateData };
        if (updateData.quantity !== undefined && updateData.quantity !== existingGain.quantity) {
            const quantityDifference = updateData.quantity - existingGain.quantity;
            adjustedData.remainingQuantity = existingGain.remainingQuantity + quantityDifference;
        }
        const updatedGain = await database_1.default.gain.update({
            where: { id: gainId },
            data: adjustedData
        });
        return updatedGain;
    }
    async getGainById(gainId) {
        return database_1.default.gain.findUnique({
            where: { id: gainId }
        });
    }
    async getAllGains() {
        return database_1.default.gain.findMany({
            orderBy: { value: 'desc' }
        });
    }
    async getAvailableGains() {
        return database_1.default.gain.findMany({
            where: {
                remainingQuantity: {
                    gt: 0
                }
            },
            orderBy: { value: 'desc' }
        });
    }
    async deleteGain(gainId) {
        const existingGain = await database_1.default.gain.findUnique({
            where: { id: gainId },
            include: {
                codes: true,
                participations: true
            }
        });
        if (!existingGain) {
            const error = new Error('Gain not found');
            error.statusCode = constants_1.HTTP_STATUS.NOT_FOUND;
            throw error;
        }
        if (existingGain.codes.length > 0 || existingGain.participations.length > 0) {
            const error = new Error('Cannot delete gain with associated codes or participations');
            error.statusCode = constants_1.HTTP_STATUS.CONFLICT;
            throw error;
        }
        await database_1.default.gain.delete({
            where: { id: gainId }
        });
    }
    async getGainStats(gainId) {
        const gain = await database_1.default.gain.findUnique({
            where: { id: gainId }
        });
        if (!gain) {
            const error = new Error('Gain not found');
            error.statusCode = constants_1.HTTP_STATUS.NOT_FOUND;
            throw error;
        }
        const [totalCodes, usedCodes, totalParticipations, claimedParticipations] = await Promise.all([
            database_1.default.code.count({
                where: { gainId }
            }),
            database_1.default.code.count({
                where: { gainId, isUsed: true }
            }),
            database_1.default.participation.count({
                where: { gainId }
            }),
            database_1.default.participation.count({
                where: { gainId, isClaimed: true }
            })
        ]);
        return {
            gain,
            totalCodes,
            usedCodes,
            totalParticipations,
            claimedParticipations
        };
    }
}
exports.GainService = GainService;
//# sourceMappingURL=gain.service.js.map