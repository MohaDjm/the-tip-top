import { Request, Response } from 'express';
export declare class EmployeeController {
    claimPrize: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getUnclaimedPrizes: (req: Request, res: Response) => Promise<void>;
    getClaimedPrizes: (req: Request, res: Response) => Promise<void>;
    getEmployeeStats: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=employee.controller.d.ts.map