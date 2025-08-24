import Redis from 'ioredis';
declare const redis: Redis;
export default redis;
export declare const setCache: (key: string, value: any, ttl?: number) => Promise<void>;
export declare const getCache: (key: string) => Promise<any>;
export declare const deleteCache: (key: string) => Promise<void>;
//# sourceMappingURL=redis.d.ts.map