import { Request, Response } from 'express';
export declare class AdminController {
    private codeService;
    private gainService;
    constructor();
    getDashboardStats: (req: Request, res: Response) => Promise<void>;
    getAllParticipations: (req: Request, res: Response) => Promise<void>;
    generateCodes: (req: Request, res: Response) => Promise<void>;
    createGain: (req: Request, res: Response) => Promise<void>;
    updateGain: (req: Request, res: Response) => Promise<void>;
    getAllUsers: (req: Request, res: Response) => Promise<void>;
    private getSystemStats;
}
//# sourceMappingURL=admin.controller.d.ts.map