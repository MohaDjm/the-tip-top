import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxRetriesPerRequest: null,
});

redis.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

redis.on('error', (error) => {
  console.error('❌ Redis connection failed:', error);
});

export default redis;

export const setCache = async (key: string, value: any, ttl?: number) => {
  try {
    const serializedValue = JSON.stringify(value);
    if (ttl) {
      await redis.setex(key, ttl, serializedValue);
    } else {
      await redis.set(key, serializedValue);
    }
  } catch (error) {
    console.error('Redis set error:', error);
  }
};

export const getCache = async (key: string) => {
  try {
    const value = await redis.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Redis get error:', error);
    return null;
  }
};

export const deleteCache = async (key: string) => {
  try {
    await redis.del(key);
  } catch (error) {
    console.error('Redis delete error:', error);
  }
};
