"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCache = exports.getCache = exports.setCache = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const redis = new ioredis_1.default({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    enableReadyCheck: false,
    maxRetriesPerRequest: null,
});
redis.on('connect', () => {
    console.log('✅ Redis connected successfully');
});
redis.on('error', (error) => {
    console.error('❌ Redis connection failed:', error);
});
exports.default = redis;
const setCache = async (key, value, ttl) => {
    try {
        const serializedValue = JSON.stringify(value);
        if (ttl) {
            await redis.setex(key, ttl, serializedValue);
        }
        else {
            await redis.set(key, serializedValue);
        }
    }
    catch (error) {
        console.error('Redis set error:', error);
    }
};
exports.setCache = setCache;
const getCache = async (key) => {
    try {
        const value = await redis.get(key);
        return value ? JSON.parse(value) : null;
    }
    catch (error) {
        console.error('Redis get error:', error);
        return null;
    }
};
exports.getCache = getCache;
const deleteCache = async (key) => {
    try {
        await redis.del(key);
    }
    catch (error) {
        console.error('Redis delete error:', error);
    }
};
exports.deleteCache = deleteCache;
//# sourceMappingURL=redis.js.map