"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/__tests__/participation.test.ts
const supertest_1 = __importDefault(require("supertest"));
const testApp_1 = __importDefault(require("../testApp"));
// Import the setup to ensure mocks are configured
require("./setup");
describe('Participation Endpoints', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('POST /api/participation/validate', () => {
        it('devrait valider un code correct', async () => {
            const mockCode = {
                id: 'code1',
                code: 'ABC123DEF4',
                isUsed: false,
                gainId: 'gain1',
                gain: {
                    id: 'gain1',
                    name: 'Infuseur à thé',
                    value: 8,
                    description: 'Un infuseur de qualité',
                },
            };
            prisma.code.findUnique.mockResolvedValue(mockCode);
            prisma.$transaction.mockImplementation(async (fn) => {
                return fn({
                    code: { update: jest.fn() },
                    participation: {
                        create: jest.fn().mockResolvedValue({
                            id: 'part1',
                            gain: mockCode.gain,
                        }),
                    },
                    gain: { update: jest.fn() },
                });
            });
            const response = await (0, supertest_1.default)(testApp_1.default)
                .post('/api/participation/validate')
                .set('Authorization', 'Bearer valid_token')
                .send({ code: 'ABC123DEF4' });
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body.gain).toHaveProperty('name', 'Infuseur à thé');
        });
        it('devrait rejeter un code invalide (mauvais format)', async () => {
            const response = await (0, supertest_1.default)(testApp_1.default)
                .post('/api/participation/validate')
                .set('Authorization', 'Bearer valid_token')
                .send({ code: 'INVALID' });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Format de code invalide');
        });
        it('devrait rejeter un code déjà utilisé', async () => {
            prisma.code.findUnique.mockResolvedValue({
                id: 'code1',
                code: 'USEDCODE12',
                isUsed: true,
            });
            const response = await (0, supertest_1.default)(testApp_1.default)
                .post('/api/participation/validate')
                .set('Authorization', 'Bearer valid_token')
                .send({ code: 'USEDCODE12' });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Ce code a déjà été utilisé');
        });
        it('devrait rejeter un code inexistant', async () => {
            prisma.code.findUnique.mockResolvedValue(null);
            const response = await (0, supertest_1.default)(testApp_1.default)
                .post('/api/participation/validate')
                .set('Authorization', 'Bearer valid_token')
                .send({ code: 'NOTEXIST12' });
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'Code invalide');
        });
    });
    describe('GET /api/participation/history', () => {
        it('devrait retourner l\'historique des participations', async () => {
            const mockParticipations = [
                {
                    id: 'part1',
                    code: { code: 'ABC123DEF4' },
                    gain: { name: 'Infuseur à thé', value: 8 },
                    participationDate: new Date('2024-01-15'),
                    isClaimed: false,
                },
                {
                    id: 'part2',
                    code: { code: 'XYZ789GHI0' },
                    gain: { name: 'Boîte de thé détox', value: 12 },
                    participationDate: new Date('2024-01-20'),
                    isClaimed: true,
                },
            ];
            prisma.participation.findMany.mockResolvedValue(mockParticipations);
            const response = await (0, supertest_1.default)(testApp_1.default)
                .get('/api/participation/history')
                .set('Authorization', 'Bearer valid_token');
            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(2);
            expect(response.body[0]).toHaveProperty('gain');
        });
    });
});
//# sourceMappingURL=participation.test.js.map