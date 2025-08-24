import { Gain } from '@prisma/client';
interface CreateGainData {
    name: string;
    value: number;
    description: string;
    quantity: number;
}
interface UpdateGainData {
    name?: string;
    value?: number;
    description?: string;
    quantity?: number;
    remainingQuantity?: number;
}
export declare class GainService {
    createGain(gainData: CreateGainData): Promise<Gain>;
    updateGain(gainId: string, updateData: UpdateGainData): Promise<Gain>;
    getGainById(gainId: string): Promise<Gain | null>;
    getAllGains(): Promise<Gain[]>;
    getAvailableGains(): Promise<Gain[]>;
    deleteGain(gainId: string): Promise<void>;
    getGainStats(gainId: string): Promise<{
        gain: Gain;
        totalCodes: number;
        usedCodes: number;
        totalParticipations: number;
        claimedParticipations: number;
    }>;
}
export {};
//# sourceMappingURL=gain.service.d.ts.map