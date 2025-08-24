import { Request, Response } from 'express';
export declare class ParticipationController {
    private codeService;
    constructor();
    participate: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getMyParticipations: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getParticipationStats: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=participation.controller.d.ts.map