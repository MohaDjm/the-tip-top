// backend/src/__tests__/setup.ts

// Variables d'environnement de test
process.env.JWT_SECRET = 'test_secret';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.CAISSE_API_KEY = 'test_caisse_key';

// Mock Prisma pour les tests
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    code: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      createMany: jest.fn(),
      update: jest.fn(),
    },
    gain: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    participation: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(),
    $disconnect: jest.fn(),
    $queryRaw: jest.fn(),
  };

  return { PrismaClient: jest.fn(() => mockPrismaClient) };
});

// Mock Redis
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    ping: jest.fn().mockResolvedValue('PONG'),
  }));
});

// This is a setup file, no tests here
describe('Setup', () => {
  it('should configure test environment', () => {
    expect(process.env.JWT_SECRET).toBe('test_secret');
  });
});
