import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Redis from 'ioredis';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Middleware de sécurité
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true
}));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

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

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
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

// Middleware pour vérifier les rôles
const roleMiddleware = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Accès refusé' });
    }
    next();
  };
};

// ===========================
// ROUTES D'AUTHENTIFICATION
// ===========================

// Inscription
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, phone, address, city, postalCode, dateOfBirth } = req.body;

    // Validation des champs requis
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'Email, mot de passe, prénom et nom sont requis' });
    }

    // Vérifier si l'utilisateur existe
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email déjà utilisé' });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone: phone || '',
        address: address || '',
        city: city || '',
        postalCode: postalCode || '',
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : new Date('1990-01-01'),
        role: 'CLIENT'
      }
    });

    // Générer un token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({ token, user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName } });
  } catch (error) {
    console.error('Erreur inscription:', error);
    res.status(500).json({ error: 'Erreur lors de l\'inscription', details: error instanceof Error ? error.message : 'Erreur inconnue' });
  }
});

// Connexion
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    console.log('🔐 Login attempt:', { email: req.body.email, hasPassword: !!req.body.password });
    
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(401).json({ error: 'Email et mot de passe requis' });
    }

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({ where: { email } });
    console.log('👤 User lookup:', { found: !!user, hasPassword: !!(user?.password) });
    
    if (!user || !user.password) {
      console.log('❌ User not found or no password');
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    // Vérifier le mot de passe
    const validPassword = await bcrypt.compare(password, user.password);
    console.log('🔑 Password check:', { valid: validPassword });
    
    if (!validPassword) {
      console.log('❌ Invalid password');
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    // Générer un token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    console.log('✅ Login successful for:', user.email);
    res.json({ token, user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role } });
  } catch (error) {
    console.error('Erreur connexion:', error);
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
});

// SSO Google/Facebook (endpoint à intégrer avec NextAuth)
app.post('/api/auth/social', async (req: Request, res: Response) => {
  try {
    const { provider, providerAccountId, email, firstName, lastName } = req.body;

    // Vérifier si le compte social existe
    let socialAccount = await prisma.socialAccount.findUnique({
      where: {
        provider_providerAccountId: {
          provider,
          providerAccountId
        }
      },
      include: { user: true }
    });

    let user;
    if (socialAccount) {
      user = socialAccount.user;
    } else {
      // Créer un nouvel utilisateur
      user = await prisma.user.create({
        data: {
          email,
          firstName,
          lastName,
          dateOfBirth: new Date(), // À compléter par l'utilisateur plus tard
          phone: '', // À compléter
          address: '', // À compléter
          city: '', // À compléter
          postalCode: '', // À compléter
          socialAccounts: {
            create: {
              provider,
              providerAccountId
            }
          }
        }
      });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({ token, user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName } });
  } catch (error) {
    console.error('Erreur auth sociale:', error);
    res.status(500).json({ error: 'Erreur lors de l\'authentification sociale' });
  }
});

// ===========================
// ROUTES DE PARTICIPATION
// ===========================

// Vérifier un code sans le marquer comme utilisé (pour la roue)
app.post('/api/participation/check-code', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { code } = req.body;

    // Vérifier le format du code (10 caractères alphanumériques)
    if (!/^[A-Z0-9]{10}$/.test(code)) {
      return res.status(400).json({ error: 'Format de code invalide' });
    }

    // Vérifier dans la base de données
    const codeEntry = await prisma.code.findUnique({
      where: { code },
      include: { gain: true }
    });

    if (!codeEntry) {
      return res.status(404).json({ error: 'Code invalide' });
    }

    if (codeEntry.isUsed) {
      return res.status(400).json({ error: 'Ce code a déjà été utilisé' });
    }

    // Retourner le gain sans marquer le code comme utilisé
    res.json({
      valid: true,
      gain: {
        name: codeEntry.gain.name,
        value: codeEntry.gain.value,
        description: codeEntry.gain.description
      }
    });
  } catch (error) {
    console.error('Erreur vérification code:', error);
    res.status(500).json({ error: 'Erreur lors de la vérification du code' });
  }
});

// Marquer un code comme utilisé après animation (claim)
app.post('/api/participation/claim', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { code } = req.body;
    const userId = req.user.id;

    // Vérifier le format du code (10 caractères alphanumériques)
    if (!/^[A-Z0-9]{10}$/.test(code)) {
      return res.status(400).json({ error: 'Format de code invalide' });
    }

    // Vérifier dans la base de données
    const codeEntry = await prisma.code.findUnique({
      where: { code },
      include: { gain: true }
    });

    if (!codeEntry) {
      return res.status(404).json({ error: 'Code invalide' });
    }

    if (codeEntry.isUsed) {
      return res.status(400).json({ error: 'Ce code a déjà été utilisé' });
    }

    // Créer la participation dans une transaction
    const participation = await prisma.$transaction(async (tx) => {
      // Marquer le code comme utilisé
      await tx.code.update({
        where: { id: codeEntry.id },
        data: { isUsed: true }
      });

      // Créer la participation
      const newParticipation = await tx.participation.create({
        data: {
          userId,
          codeId: codeEntry.id,
          gainId: codeEntry.gainId,
          ipAddress: req.ip || 'unknown',
          userAgent: req.headers['user-agent'] || 'unknown'
        },
        include: { gain: true }
      });

      // Décrémenter le stock de gains restants
      await tx.gain.update({
        where: { id: codeEntry.gainId },
        data: { remainingQuantity: { decrement: 1 } }
      });

      return newParticipation;
    });

    res.json({
      success: true,
      participation: {
        id: participation.id,
        gain: {
          name: participation.gain.name,
          value: participation.gain.value,
          description: participation.gain.description
        },
        participationDate: participation.participationDate
      }
    });
  } catch (error) {
    console.error('Erreur claim code:', error);
    res.status(500).json({ error: 'Erreur lors de la réclamation du gain' });
  }
});

// Valider un code et participer (DEPRECATED - utiliser check-code + claim)
app.post('/api/participation/validate', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { code } = req.body;
    const userId = req.user.id;

    // Vérifier le format du code (10 caractères alphanumériques)
    if (!/^[A-Z0-9]{10}$/.test(code)) {
      return res.status(400).json({ error: 'Format de code invalide' });
    }

    // Vérifier dans le cache Redis d'abord
    const cachedResult = await redis.get(`code:${code}`);
    if (cachedResult === 'used') {
      return res.status(400).json({ error: 'Ce code a déjà été utilisé' });
    }

    // Vérifier dans la base de données
    const codeEntry = await prisma.code.findUnique({
      where: { code },
      include: { gain: true }
    });

    if (!codeEntry) {
      return res.status(404).json({ error: 'Code invalide' });
    }

    if (codeEntry.isUsed) {
      // Mettre en cache pour les futures vérifications
      await redis.set(`code:${code}`, 'used', 'EX', 3600);
      return res.status(400).json({ error: 'Ce code a déjà été utilisé' });
    }

    // Créer la participation dans une transaction
    const participation = await prisma.$transaction(async (tx) => {
      // Marquer le code comme utilisé
      await tx.code.update({
        where: { id: codeEntry.id },
        data: { isUsed: true }
      });

      // Créer la participation
      const newParticipation = await tx.participation.create({
        data: {
          userId,
          codeId: codeEntry.id,
          gainId: codeEntry.gainId,
          ipAddress: req.ip || 'unknown',
          userAgent: req.headers['user-agent'] || 'unknown'
        },
        include: { gain: true }
      });

      // Décrémenter le stock de gains restants
      await tx.gain.update({
        where: { id: codeEntry.gainId },
        data: { remainingQuantity: { decrement: 1 } }
      });

      return newParticipation;
    });

    // Mettre en cache le code utilisé
    await redis.set(`code:${code}`, 'used', 'EX', 3600);

    // Envoyer un email de confirmation (à implémenter)
    // await sendConfirmationEmail(req.user.email, participation.gain);

    res.json({
      success: true,
      gain: {
        name: participation.gain.name,
        value: participation.gain.value,
        description: participation.gain.description
      },
      participationId: participation.id
    });
  } catch (error) {
    console.error('Erreur validation code:', error);
    res.status(500).json({ error: 'Erreur lors de la validation du code' });
  }
});

// Récupérer l'historique des participations
app.get('/api/participation/history', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const participations = await prisma.participation.findMany({
      where: { userId: req.user.id },
      include: { gain: true, code: true },
      orderBy: { participationDate: 'desc' }
    });

    res.json(participations);
  } catch (error) {
    console.error('Erreur récupération historique:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'historique' });
  }
});

// ===========================
// ROUTES POUR LES CAISSES
// ===========================

// Endpoint pour les caisses - Vérifier si un code est valide
app.post('/api/caisse/verify-code', async (req: Request, res: Response) => {
  try {
    const { code, apiKey } = req.body;

    // Vérifier l'API key des caisses
    if (apiKey !== process.env.CAISSE_API_KEY) {
      return res.status(401).json({ error: 'API key invalide' });
    }

    const codeEntry = await prisma.code.findUnique({
      where: { code },
      include: { gain: true }
    });

    if (!codeEntry) {
      return res.json({ valid: false, message: 'Code invalide' });
    }

    if (codeEntry.isUsed) {
      return res.json({ valid: false, message: 'Code déjà utilisé' });
    }

    res.json({
      valid: true,
      gain: {
        name: codeEntry.gain.name,
        value: codeEntry.gain.value
      }
    });
  } catch (error) {
    console.error('Erreur vérification code caisse:', error);
    res.status(500).json({ error: 'Erreur lors de la vérification' });
  }
});

// ===========================
// ROUTES EMPLOYÉS
// ===========================

// Rechercher un gain client
app.post('/api/employee/search-gain', authMiddleware, roleMiddleware(['EMPLOYEE', 'ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const { searchTerm } = req.body;

    // Rechercher par code ou email
    let participation;
    
    // Si c'est un code (10 caractères)
    if (/^[A-Z0-9]{10}$/.test(searchTerm)) {
      participation = await prisma.participation.findFirst({
        where: {
          code: { code: searchTerm }
        },
        include: {
          user: true,
          gain: true,
          code: true
        }
      });
    } else {
      // Sinon rechercher par email
      participation = await prisma.participation.findFirst({
        where: {
          user: { email: searchTerm },
          isClaimed: false
        },
        include: {
          user: true,
          gain: true,
          code: true
        },
        orderBy: { participationDate: 'desc' }
      });
    }

    if (!participation) {
      return res.status(404).json({ error: 'Aucun gain trouvé' });
    }

    res.json({
      participationId: participation.id,
      client: {
        name: `${participation.user.firstName} ${participation.user.lastName}`,
        email: participation.user.email
      },
      gain: {
        name: participation.gain.name,
        value: participation.gain.value
      },
      code: participation.code.code,
      isClaimed: participation.isClaimed,
      claimedAt: participation.claimedAt
    });
  } catch (error) {
    console.error('Erreur recherche gain:', error);
    res.status(500).json({ error: 'Erreur lors de la recherche' });
  }
});

// Marquer un gain comme remis
app.post('/api/employee/mark-claimed', authMiddleware, roleMiddleware(['EMPLOYEE', 'ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const { participationId } = req.body;

    const participation = await prisma.participation.update({
      where: { id: participationId },
      data: {
        isClaimed: true,
        claimedAt: new Date(),
        claimedByEmployeeId: req.user.id
      }
    });

    res.json({ success: true, participation });
  } catch (error) {
    console.error('Erreur marquage gain:', error);
    res.status(500).json({ error: 'Erreur lors du marquage' });
  }
});

// ===========================
// ROUTES ADMINISTRATION
// ===========================

// Statistiques générales
app.get('/api/admin/stats', authMiddleware, roleMiddleware(['ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    // Statistiques globales
    const totalCodes = await prisma.code.count();
    const usedCodes = await prisma.code.count({ where: { isUsed: true } });
    const totalParticipations = await prisma.participation.count();
    const claimedGains = await prisma.participation.count({ where: { isClaimed: true } });

    // Statistiques par gain
    const gainStats = await prisma.gain.findMany({
      include: {
        _count: {
          select: { participations: true }
        }
      }
    });

    // Démographie (gestion des cas où il n'y a pas de participations)
    let ageGroups: any[] = [];
    try {
      if (totalParticipations > 0) {
        const rawAgeGroups = await prisma.$queryRaw`
          SELECT 
            CASE 
              WHEN EXTRACT(YEAR FROM AGE(NOW(), "dateOfBirth")) < 25 THEN '18-25'
              WHEN EXTRACT(YEAR FROM AGE(NOW(), "dateOfBirth")) < 35 THEN '26-35'
              WHEN EXTRACT(YEAR FROM AGE(NOW(), "dateOfBirth")) < 45 THEN '36-45'
              WHEN EXTRACT(YEAR FROM AGE(NOW(), "dateOfBirth")) < 60 THEN '46-60'
              ELSE '60+'
            END as age_group,
            COUNT(*) as count
          FROM "User"
          JOIN "Participation" ON "User".id = "Participation"."userId"
          GROUP BY age_group
        ` as any[];
        
        // Convertir BigInt en Number pour éviter l'erreur de sérialisation
        ageGroups = rawAgeGroups.map(group => ({
          age_group: group.age_group,
          count: Number(group.count)
        }));
      }
    } catch (demographicsError) {
      console.warn('Erreur démographie (ignorée):', demographicsError);
      ageGroups = [];
    }

    res.json({
      global: {
        totalCodes,
        usedCodes,
        participationRate: totalCodes > 0 ? ((usedCodes / totalCodes) * 100).toFixed(2) : '0.00',
        totalParticipations,
        claimedGains
      },
      gains: gainStats.map(gain => ({
        name: gain.name,
        totalQuantity: gain.quantity,
        distributed: gain._count.participations,
        remaining: gain.remainingQuantity,
        percentage: gain.quantity > 0 ? ((gain._count.participations / gain.quantity) * 100).toFixed(2) : '0.00'
      })),
      demographics: {
        ageGroups
      }
    });
  } catch (error) {
    console.error('Erreur statistiques:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
});

// Participations récentes pour admin
app.get('/api/admin/recent-participations', authMiddleware, roleMiddleware(['ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const recentParticipations = await prisma.participation.findMany({
      take: 50,
      orderBy: { participationDate: 'desc' },
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true }
        },
        code: {
          select: { code: true }
        },
        gain: {
          select: { name: true, value: true }
        }
      }
    });

    res.json(recentParticipations);
  } catch (error) {
    console.error('Erreur participations récentes:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des participations récentes' });
  }
});

// Gains pour admin
app.get('/api/admin/gains', authMiddleware, roleMiddleware(['ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const gains = await prisma.gain.findMany({
      include: {
        _count: {
          select: { participations: true }
        }
      }
    });

    // Enrichir les données avec les informations de codes
    const enrichedGains = await Promise.all(gains.map(async (gain) => {
      const totalCodes = await prisma.code.count({ where: { gainId: gain.id } });
      const usedCodes = await prisma.code.count({ where: { gainId: gain.id, isUsed: true } });
      
      return {
        ...gain,
        totalCodes,
        usedCodes,
        distributed: gain._count.participations,
        remaining: gain.remainingQuantity
      };
    }));

    res.json(enrichedGains);
  } catch (error) {
    console.error('Erreur gains:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des gains' });
  }
});

// Toutes les participations pour admin
app.get('/api/admin/participations', authMiddleware, roleMiddleware(['ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const participations = await prisma.participation.findMany({
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true }
        },
        code: {
          select: { code: true }
        },
        gain: {
          select: { name: true, value: true }
        }
      },
      orderBy: { participationDate: 'desc' }
    });

    res.json(participations);
  } catch (error) {
    console.error('Erreur participations:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des participations' });
  }
});

// Utilisateurs pour admin
app.get('/api/admin/users', authMiddleware, roleMiddleware(['ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: { participations: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(users);
  } catch (error) {
    console.error('Erreur utilisateurs:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
  }
});

// Stats pour employé
app.get('/api/employee/stats', authMiddleware, roleMiddleware(['EMPLOYEE', 'ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const totalParticipations = await prisma.participation.count();
    const claimedGains = await prisma.participation.count({ where: { isClaimed: true } });
    const unclaimedGains = await prisma.participation.count({ where: { isClaimed: false } });

    res.json({
      totalParticipations,
      claimedGains,
      unclaimedGains
    });
  } catch (error) {
    console.error('Erreur stats employé:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
});

// Prix non réclamés pour employé
app.get('/api/employee/unclaimed-prizes', authMiddleware, roleMiddleware(['EMPLOYEE', 'ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const unclaimedPrizes = await prisma.participation.findMany({
      where: { isClaimed: false },
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true }
        },
        gain: {
          select: { name: true, value: true }
        }
      },
      orderBy: { participationDate: 'desc' }
    });

    res.json(unclaimedPrizes);
  } catch (error) {
    console.error('Erreur prix non réclamés:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des prix non réclamés' });
  }
});

// Prix réclamés pour employé
app.get('/api/employee/claimed-prizes', authMiddleware, roleMiddleware(['EMPLOYEE', 'ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const claimedPrizes = await prisma.participation.findMany({
      where: { isClaimed: true },
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true }
        },
        gain: {
          select: { name: true, value: true }
        }
      },
      orderBy: { claimedAt: 'desc' }
    });

    res.json(claimedPrizes);
  } catch (error) {
    console.error('Erreur prix réclamés:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des prix réclamés' });
  }
});

// Réclamer un prix (employé)
app.post('/api/employee/claim-prize/:participationId', authMiddleware, roleMiddleware(['EMPLOYEE', 'ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const { participationId } = req.params;

    const participation = await prisma.participation.update({
      where: { id: participationId },
      data: { 
        isClaimed: true,
        claimedAt: new Date()
      },
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true }
        },
        gain: {
          select: { name: true, value: true }
        }
      }
    });

    res.json(participation);
  } catch (error) {
    console.error('Erreur réclamation prix:', error);
    res.status(500).json({ error: 'Erreur lors de la réclamation du prix' });
  }
});

// Export des emails pour campagne marketing
app.get('/api/admin/export-emails', authMiddleware, roleMiddleware(['ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        participations: {
          some: {}
        }
      },
      select: {
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        _count: {
          select: { participations: true }
        }
      }
    });

    // Format CSV
    const csv = 'Email,Prénom,Nom,Date inscription,Participations\n' + 
      users.map(u => 
        `${u.email},${u.firstName},${u.lastName},${u.createdAt.toISOString()},${u._count.participations}`
      ).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="export_emails.csv"');
    res.send(csv);
  } catch (error) {
    console.error('Erreur export emails:', error);
    res.status(500).json({ error: 'Erreur lors de l\'export' });
  }
});

// ===========================
// TIRAGE AU SORT FINAL
// ===========================

app.post('/api/admin/grand-tirage', authMiddleware, roleMiddleware(['ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    // Récupérer tous les participants uniques
    const participants = await prisma.user.findMany({
      where: {
        participations: {
          some: {}
        }
      }
    });

    if (participants.length === 0) {
      return res.status(400).json({ error: 'Aucun participant au tirage' });
    }

    // Sélectionner un gagnant aléatoirement
    const winnerIndex = Math.floor(Math.random() * participants.length);
    const winner = participants[winnerIndex];

    // Enregistrer le résultat (à créer une table spécifique si nécessaire)
    
    res.json({
      winner: {
        id: winner.id,
        name: `${winner.firstName} ${winner.lastName}`,
        email: winner.email
      },
      totalParticipants: participants.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erreur tirage au sort:', error);
    res.status(500).json({ error: 'Erreur lors du tirage au sort' });
  }
});

// Health check pour le monitoring
app.get('/api/health', async (req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    await redis.ping();
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', error: error });
  }
});

// Démarrage du serveur
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 API démarrée sur le port ${PORT}`);
  console.log(`📊 Environnement: ${process.env.NODE_ENV || 'development'}`);
});