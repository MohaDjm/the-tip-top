// backend/src/__tests__/auth.test.ts
import request from 'supertest';
import app from '../testApp';

// Import the setup to ensure mocks are configured
import './setup';

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

      const response = await request(app)
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

      const response = await request(app)
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

      const response = await request(app)
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

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      // Should have proper error structure even if user doesn't exist
      expect(response.body).toHaveProperty('error');
      expect(typeof response.body.error).toBe('string');
    });
  });
});
