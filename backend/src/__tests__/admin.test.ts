// backend/src/__tests__/admin.test.ts
import request from 'supertest';
import { PrismaClient } from '@prisma/client';

describe('Admin Endpoints', () => {
  let app: any;
  let prisma: any;

  beforeEach(() => {
    prisma = new PrismaClient();
    jest.clearAllMocks();
  });

  describe('GET /api/admin/stats', () => {
    it('devrait retourner les statistiques générales', async () => {
      prisma.code.count.mockResolvedValueOnce(500000); // total
      prisma.code.count.mockResolvedValueOnce(150000); // utilisés
      prisma.participation.count.mockResolvedValueOnce(150000); // participations
      prisma.participation.count.mockResolvedValueOnce(50000); // réclamés

      prisma.gain.findMany.mockResolvedValue([
        {
          id: 'gain1',
          name: 'Infuseur à thé',
          quantity: 300000,
          remainingQuantity: 210000,
          _count: { participations: 90000 },
        },
      ]);

      prisma.$queryRaw.mockResolvedValue([
        { age_group: '18-25', count: 15000 },
        { age_group: '26-35', count: 35000 },
      ]);

      const response = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', 'Bearer admin_token');

      expect(response.status).toBe(200);
      expect(response.body.global).toHaveProperty('totalCodes', 500000);
      expect(response.body.global).toHaveProperty('participationRate');
      expect(response.body.gains).toBeInstanceOf(Array);
      expect(response.body.demographics).toHaveProperty('ageGroups');
    });
  });

  describe('GET /api/admin/export-emails', () => {
    it('devrait exporter les emails en CSV', async () => {
      const mockUsers = [
        {
          email: 'user1@example.com',
          firstName: 'Jean',
          lastName: 'Dupont',
          createdAt: new Date('2024-01-01'),
          _count: { participations: 2 },
        },
        {
          email: 'user2@example.com',
          firstName: 'Marie',
          lastName: 'Martin',
          createdAt: new Date('2024-01-02'),
          _count: { participations: 1 },
        },
      ];

      prisma.user.findMany.mockResolvedValue(mockUsers);

      const response = await request(app)
        .get('/api/admin/export-emails')
        .set('Authorization', 'Bearer admin_token');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('text/csv');
      expect(response.headers['content-disposition']).toContain('export_emails.csv');
      expect(response.text).toContain('user1@example.com');
      expect(response.text).toContain('user2@example.com');
    });
  });
});
