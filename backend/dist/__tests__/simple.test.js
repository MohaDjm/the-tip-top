"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/__tests__/simple.test.ts
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
// Create a simple test app
const app = (0, express_1.default)();
app.use(express_1.default.json());
// Simple test routes
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});
app.post('/api/auth/register', (req, res) => {
    const { email, password, firstName, lastName } = req.body;
    if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ error: 'Tous les champs sont requis' });
    }
    res.status(201).json({
        message: 'Utilisateur créé avec succès',
        token: 'mock_token',
        user: { email, firstName, lastName, role: 'CLIENT' }
    });
});
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email et mot de passe requis' });
    }
    res.json({
        message: 'Connexion réussie',
        token: 'mock_token',
        user: { email, firstName: 'Test', lastName: 'User', role: 'CLIENT' }
    });
});
describe('Basic API Tests', () => {
    describe('Health Check', () => {
        it('should return ok status', async () => {
            const response = await (0, supertest_1.default)(app)
                .get('/health');
            expect(response.status).toBe(200);
            expect(response.body.status).toBe('ok');
        });
    });
    describe('Authentication', () => {
        it('should register user with valid data', async () => {
            const userData = {
                email: 'test@example.com',
                password: 'Password123!',
                firstName: 'John',
                lastName: 'Doe'
            };
            const response = await (0, supertest_1.default)(app)
                .post('/api/auth/register')
                .send(userData);
            expect(response.status).toBe(201);
            expect(response.body.message).toBe('Utilisateur créé avec succès');
            expect(response.body.token).toBeDefined();
            expect(response.body.user.email).toBe(userData.email);
        });
        it('should reject registration with missing fields', async () => {
            const invalidData = {
                email: 'test@example.com'
                // Missing required fields
            };
            const response = await (0, supertest_1.default)(app)
                .post('/api/auth/register')
                .send(invalidData);
            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Tous les champs sont requis');
        });
        it('should login with email and password', async () => {
            const loginData = {
                email: 'test@example.com',
                password: 'Password123!'
            };
            const response = await (0, supertest_1.default)(app)
                .post('/api/auth/login')
                .send(loginData);
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Connexion réussie');
            expect(response.body.token).toBeDefined();
        });
        it('should reject login with missing credentials', async () => {
            const incompleteData = {
                email: 'test@example.com'
                // Missing password
            };
            const response = await (0, supertest_1.default)(app)
                .post('/api/auth/login')
                .send(incompleteData);
            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Email et mot de passe requis');
        });
    });
});
//# sourceMappingURL=simple.test.js.map