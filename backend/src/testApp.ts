// backend/src/testApp.ts
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Create Express app
const app = express();

// Mock Prisma for tests
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
  code: {
    findUnique: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  participation: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  $transaction: jest.fn(),
};

const prisma = process.env.NODE_ENV === 'test' ? mockPrisma as any : new PrismaClient();

// Middleware de sécurité (sans morgan pour les tests)
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting pour prévenir les abus
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limite de 100 requêtes
  message: 'Trop de requêtes, veuillez réessayer plus tard'
});

app.use('/api/', limiter);

// Middleware d'authentification
interface AuthRequest extends Request {
  user?: any;
}

const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Token manquant' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return res.status(401).json({ error: 'Utilisateur non trouvé' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token invalide' });
  }
};

// Routes d'authentification
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: 'CLIENT',
        dateOfBirth: new Date('1990-01-01'),
        phone: '0123456789',
        address: '123 Test Street',
        city: 'Test City',
        postalCode: '12345'
      }
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({ error: 'Erreur lors de l\'inscription' });
  }
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password || '');

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Connexion réussie',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
});

// Routes de participation
app.post('/api/participation/validate-code', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { code } = req.body;
    const userId = req.user.id;

    if (!code) {
      return res.status(400).json({ error: 'Code requis' });
    }

    const codeEntry = await prisma.code.findUnique({
      where: { code },
      include: { gain: true }
    });

    if (!codeEntry) {
      return res.status(404).json({ error: 'Code invalide' });
    }

    if (codeEntry.isUsed) {
      return res.status(400).json({ error: 'Code déjà utilisé' });
    }

    const participation = await prisma.$transaction(async (tx) => {
      await tx.code.update({
        where: { id: codeEntry.id },
        data: { isUsed: true }
      });

      return tx.participation.create({
        data: {
          userId,
          codeId: codeEntry.id,
          gainId: codeEntry.gainId,
          participationDate: new Date(),
          ipAddress: '127.0.0.1',
          userAgent: 'test-agent'
        },
        include: {
          gain: true,
          code: true
        }
      });
    });

    res.json({
      message: 'Code validé avec succès',
      participation: {
        id: participation.id,
        gain: participation.gain,
        participationDate: participation.participationDate
      }
    });
  } catch (error) {
    console.error('Erreur validation code:', error);
    res.status(500).json({ error: 'Erreur lors de la validation' });
  }
});

app.get('/api/participation/history', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;

    const participations = await prisma.participation.findMany({
      where: { userId },
      include: {
        gain: true,
        code: true
      },
      orderBy: { participationDate: 'desc' }
    });

    res.json({ participations });
  } catch (error) {
    console.error('Erreur historique:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération' });
  }
});

// Routes admin
app.get('/api/admin/stats', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    const totalUsers = await prisma.user.count();
    const totalParticipations = await prisma.participation.count();
    const totalCodes = await prisma.code.count();
    const usedCodes = await prisma.code.count({ where: { isUsed: true } });

    res.json({
      totalUsers,
      totalParticipations,
      totalCodes,
      usedCodes,
      availableCodes: totalCodes - usedCodes
    });
  } catch (error) {
    console.error('Erreur stats admin:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des stats' });
  }
});

app.get('/api/admin/export-emails', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    const users = await prisma.user.findMany({
      select: {
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true
      }
    });

    const csv = [
      'Email,Prénom,Nom,Date inscription',
      ...users.map(user => 
        `${user.email},${user.firstName},${user.lastName},${user.createdAt.toISOString()}`
      )
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=emails.csv');
    res.send(csv);
  } catch (error) {
    console.error('Erreur export emails:', error);
    res.status(500).json({ error: 'Erreur lors de l\'export' });
  }
});

// Routes employé
app.get('/api/employee/search-gain/:code', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'EMPLOYEE' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    const { code } = req.params;

    const participation = await prisma.participation.findFirst({
      where: {
        code: { code }
      },
      include: {
        gain: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    if (!participation) {
      return res.status(404).json({ error: 'Aucun gain trouvé pour ce code' });
    }

    res.json({ participation });
  } catch (error) {
    console.error('Erreur recherche gain:', error);
    res.status(500).json({ error: 'Erreur lors de la recherche' });
  }
});

app.post('/api/employee/mark-claimed/:participationId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'EMPLOYEE' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    const { participationId } = req.params;

    const participation = await prisma.participation.update({
      where: { id: participationId },
      data: {
        isClaimed: true,
        claimedAt: new Date(),
        claimedByEmployeeId: req.user.id
      },
      include: {
        gain: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    res.json({
      message: 'Gain marqué comme récupéré',
      participation
    });
  } catch (error) {
    console.error('Erreur marquage gain:', error);
    res.status(500).json({ error: 'Erreur lors du marquage' });
  }
});

export default app;
