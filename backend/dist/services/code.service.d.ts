import { Code, Gain, Participation } from '@prisma/client';
interface ParticipationResult {
    participation: Participation & {
        gain: Gain;
        code: Code;
    };
    isWinner: boolean;
}
interface ParticipationStats {
    totalParticipations: number;
    totalWins: number;
    totalValue: number;
    claimedPrizes: number;
    unclaimedPrizes: number;
}
export declare class CodeService {
    private emailService;
    constructor();
    generateCodes(gainId: string, quantity: number): Promise<Code[]>;
    participateWithCode(userId: string, codeString: string, ipAddress: string, userAgent: string): Promise<ParticipationResult>;
    getUserParticipations(userId: string, page?: number, limit?: number): Promise<{
        participations: (Participation & {
            gain: Gain;
            code: Pick<Code, 'code'>;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    getUserParticipationStats(userId: string): Promise<ParticipationStats>;
    getUserTodayParticipation(userId: string, today: Date, tomorrow: Date): Promise<Participation | null>;
    getCodeByString(codeString: string): Promise<Code & {
        gain: Gain;
    } | null>;
    getAllCodes(page?: number, limit?: number, gainId?: string, isUsed?: boolean): Promise<{
        codes: (Code & {
            gain: Gain;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
}
export {};
//# sourceMappingURL=code.service.d.ts.map