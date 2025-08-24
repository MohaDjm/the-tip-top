"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/__tests__/auth.test.ts
const supertest_1 = __importDefault(require("supertest"));
const testApp_1 = __importDefault(require("../testApp"));
// Import the setup to ensure mocks are configured
require("./setup");
describe('Authentication Endpoints', () => {
    beforeEach(() => {
        // Réinitialiser les mocks
        jest.clearAllMocks();
    });
    describe('POST /api/auth/register', () => {
        it('devrait créer un nouvel utilisateur avec des données valides', async () => {
            const userData = {
                email: 'test@example.com',
                password: 'Password123!',
                firstName: 'John',
                lastName: 'Doe'
            };
            const response = await (0, supertest_1.default)(testApp_1.default)
                .post('/api/auth/register')
                .send(userData);
            // Test basic response structure
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('message');
            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('user');
        });
        it('devrait rejeter des données invalides', async () => {
            const invalidData = {
                email: 'test@example.com'
                // Missing required fields
            };
            const response = await (0, supertest_1.default)(testApp_1.default)
                .post('/api/auth/register')
                .send(invalidData);
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });
    });
    describe('POST /api/auth/login', () => {
        it('devrait rejeter des données manquantes', async () => {
            const incompleteData = {
                email: 'test@example.com'
                // Missing password
            };
            const response = await (0, supertest_1.default)(testApp_1.default)
                .post('/api/auth/login')
                .send(incompleteData);
            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Email et mot de passe requis');
        });
        it('devrait avoir la structure de réponse correcte', async () => {
            const loginData = {
                email: 'test@example.com',
                password: 'Password123!'
            };
            const response = await (0, supertest_1.default)(testApp_1.default)
                .post('/api/auth/login')
                .send(loginData);
            // Should have proper error structure even if user doesn't exist
            expect(response.body).toHaveProperty('error');
            expect(typeof response.body.error).toBe('string');
        });
    });
});
//# sourceMappingURL=auth.test.js.map