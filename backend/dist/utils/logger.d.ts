import winston from 'winston';
export declare const logger: winston.Logger;
export declare const morganStream: {
    write: (message: string) => void;
};
export declare const logError: (message: string, error?: any) => void;
export declare const logInfo: (message: string, meta?: any) => void;
export declare const logWarn: (message: string, meta?: any) => void;
export declare const logDebug: (message: string, meta?: any) => void;
export declare const logRequest: (req: any, res: any, next: any) => void;
//# sourceMappingURL=logger.d.ts.map