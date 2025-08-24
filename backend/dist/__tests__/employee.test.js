"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/__tests__/employee.test.ts
const supertest_1 = __importDefault(require("supertest"));
const client_1 = require("@prisma/client");
describe('Employee Endpoints', () => {
    let app;
    let prisma;
    beforeEach(() => {
        prisma = new client_1.PrismaClient();
        jest.clearAllMocks();
    });
    describe('POST /api/employee/search-gain', () => {
        it('devrait trouver un gain par code', async () => {
            const mockParticipation = {
                id: 'part1',
                user: {
                    firstName: 'Jean',
                    lastName: 'Dupont',
                    email: 'jean@example.com',
                },
                gain: { name: 'Infuseur à thé', value: 8 },
                code: { code: 'ABC123DEF4' },
                isClaimed: false,
                claimedAt: null,
            };
            prisma.participation.findFirst.mockResolvedValue(mockParticipation);
            const response = await (0, supertest_1.default)(app)
                .post('/api/employee/search-gain')
                .set('Authorization', 'Bearer employee_token')
                .send({ searchTerm: 'ABC123DEF4' });
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('participationId', 'part1');
            expect(response.body.client).toHaveProperty('name', 'Jean Dupont');
            expect(response.body.gain).toHaveProperty('name', 'Infuseur à thé');
        });
        it('devrait retourner 404 si aucun gain trouvé', async () => {
            prisma.participation.findFirst.mockResolvedValue(null);
            const response = await (0, supertest_1.default)(app)
                .post('/api/employee/search-gain')
                .set('Authorization', 'Bearer employee_token')
                .send({ searchTerm: 'NOTFOUND99' });
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'Aucun gain trouvé');
        });
    });
    describe('POST /api/employee/mark-claimed', () => {
        it('devrait marquer un gain comme remis', async () => {
            const updatedParticipation = {
                id: 'part1',
                isClaimed: true,
                claimedAt: new Date(),
                claimedByEmployeeId: 'emp1',
            };
            prisma.participation.update.mockResolvedValue(updatedParticipation);
            const response = await (0, supertest_1.default)(app)
                .post('/api/employee/mark-claimed')
                .set('Authorization', 'Bearer employee_token')
                .send({ participationId: 'part1' });
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body.participation).toHaveProperty('isClaimed', true);
        });
    });
});
//# sourceMappingURL=employee.test.js.map