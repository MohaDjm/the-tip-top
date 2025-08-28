import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import csrf from 'csurf';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Redis from 'ioredis';
import { EmailService } from './services/email.service';

dotenv.config();

const app = express();

// Trust proxy pour Nginx reverse proxy
app.set('trust proxy', true);

const prisma = new PrismaClient();
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Configuration CORS globale
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://164.68.103.88',
    process.env.FRONTEND_URL
  ].filter(Boolean);
  
  // Pour les requêtes via Nginx reverse proxy, accepter toutes les origines du même domaine
  if (allowedOrigins.includes(origin) || !origin) {
    res.header('Access-Control-Allow-Origin', origin || '*');
  }
  
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Middleware de sécurité
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Protection CSRF
const csrfProtection = csrf({ cookie: true });
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
const handleValidateCode = async (req: AuthRequest, res: Response) => {
  try {
    const { code } = req.body;

    // Vérifier le format du code (10 caractères numériques)
    if (!/^[0-9]{10}$/.test(code)) {
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
};

// === DÉFINIR LES DEUX ROUTES QUI UTILISENT LA MÊME LOGIQUE ===
app.post('/api/participation/check-code', authMiddleware, handleValidateCode);
app.post('/api/participation/validate-code', authMiddleware, handleValidateCode);

// Marquer un code comme utilisé après animation (claim)
app.post('/api/participation/claim', authMiddleware, async (req: AuthRequest, res: Response) => {
  console.log('🎯 Début de la réclamation du code:', req.body.code);
  
  try {
    const { code } = req.body;
    const userId = req.user.id;

    console.log('👤 Utilisateur ID:', userId);

    // Vérifier le format du code (10 caractères numériques)
    if (!/^[0-9]{10}$/.test(code)) {
      console.log('❌ Format de code invalide:', code);
      return res.status(400).json({ error: 'Format de code invalide' });
    }

    console.log('✅ Format de code valide');

    // Vérifier dans la base de données
    const codeEntry = await prisma.code.findUnique({
      where: { code },
      include: { gain: true }
    });

    if (!codeEntry) {
      console.log('❌ Code non trouvé dans la base:', code);
      return res.status(404).json({ error: 'Code invalide' });
    }

    console.log('✅ Code trouvé:', codeEntry.code, 'Gain:', codeEntry.gain.name);

    if (codeEntry.isUsed) {
      console.log('❌ Code déjà utilisé:', code);
      return res.status(400).json({ error: 'Ce code a déjà été utilisé' });
    }

    console.log('🔄 Début de la transaction...');

    // Créer la participation dans une transaction
    const participation = await prisma.$transaction(async (tx) => {
      console.log('📝 Marquage du code comme utilisé...');
      // Marquer le code comme utilisé
      await tx.code.update({
        where: { id: codeEntry.id },
        data: { isUsed: true }
      });

      console.log('🎟️ Création de la participation...');
      
      // Vérifier s'il existe déjà une participation pour ce code
      const existingParticipation = await tx.participation.findUnique({
        where: { codeId: codeEntry.id }
      });

      if (existingParticipation) {
        throw new Error(`Code ${code} already has a participation`);
      }

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

      console.log('📦 Décrémentation du stock de gains...');
      // Décrémenter le stock de gains restants
      await tx.gain.update({
        where: { id: codeEntry.gainId },
        data: { remainingQuantity: { decrement: 1 } }
      });

      console.log('✅ Transaction terminée avec succès');
      return newParticipation;
    });

    console.log('📤 Envoi de la réponse de succès...');
    
    const response = {
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
    };

    console.log('✅ Réponse préparée:', response);
    res.json(response);
    console.log('✅ Réponse envoyée avec succès');
    
  } catch (error) {
    console.error('❌ ERREUR dans claim code:', error);
    if (error instanceof Error) {
      console.error('❌ Stack trace:', error.stack);
    }
    
    // S'assurer que la réponse n'a pas déjà été envoyée
    if (!res.headersSent) {
      console.log('📤 Envoi de la réponse d\'erreur...');
      res.status(500).json({ error: 'Erreur lors de la réclamation du gain' });
    } else {
      console.log('⚠️ Headers déjà envoyés, impossible d\'envoyer une réponse d\'erreur');
    }
  }
});

// Valider un code et participer (DEPRECATED - utiliser check-code + claim)
app.post('/api/participation/validate', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { code } = req.body;
    const userId = req.user.id;

    // Vérifier le format du code (10 caractères numériques)
    if (!/^[0-9]{10}$/.test(code)) {
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
    
    // S'assurer que la réponse n'a pas déjà été envoyée
    if (!res.headersSent) {
      res.status(500).json({ error: 'Erreur lors de la validation du code' });
    }
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

// Dashboard stats (new endpoint for frontend)
app.get('/api/admin/dashboard/stats', authMiddleware, roleMiddleware(['ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const [
      totalUsers,
      totalParticipations,
      totalCodes,
      usedCodes,
      claimedPrizes,
      totalGains
    ] = await Promise.all([
      prisma.user.count(),
      prisma.participation.count(),
      prisma.code.count(),
      prisma.code.count({ where: { isUsed: true } }),
      prisma.participation.count({ where: { isClaimed: true } }),
      prisma.gain.count()
    ]);

    const stats = {
      totalUsers,
      totalParticipations,
      totalCodes,
      usedCodes,
      availableCodes: totalCodes - usedCodes,
      claimedPrizes,
      unclaimedPrizes: totalParticipations - claimedPrizes,
      totalGains
    };

    res.json({
      success: true,
      message: 'Dashboard stats retrieved successfully',
      data: stats
    });
  } catch (error: any) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard stats'
    });
  }
});

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

    // Compter les utilisateurs
    const totalUsers = await prisma.user.count();
    
    // Calculer la valeur totale distribuée
    const claimedParticipations = await prisma.participation.findMany({
      where: { isClaimed: true },
      include: { gain: true }
    });
    const totalValue = claimedParticipations.reduce((sum, p) => sum + Number(p.gain.value), 0);

    res.json({
      global: {
        totalUsers,
        totalCodes,
        usedCodes,
        participationRate: totalCodes > 0 ? ((usedCodes / totalCodes) * 100).toFixed(2) : '0.00',
        totalParticipations,
        claimedGains,
        totalValue
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
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des statistiques' });
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

    res.json({ success: true, data: recentParticipations });
  } catch (error) {
    console.error('Erreur participations récentes:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des participations récentes' });
  }
});

// Public gains endpoint (basic info)
app.get('/api/gains', async (req: Request, res: Response) => {
  try {
    const gains = await prisma.gain.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        value: true,
        quantity: true,
        remainingQuantity: true
      }
    });

    res.json({
      success: true,
      data: gains
    });
  } catch (error) {
    console.error('Erreur gains publics:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des gains'
    });
  }
});

// Newsletter subscription endpoint
app.post('/api/newsletter/subscribe', async (req: Request, res: Response) => {
  try {
    const { email, firstName } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'Email valide requis'
      });
    }

    // Check if email already subscribed
    const existingSubscription = await prisma.newsletterSubscription.findUnique({
      where: { email }
    });

    if (existingSubscription) {
      return res.status(400).json({
        success: false,
        message: 'Cette adresse email est déjà abonnée à notre newsletter'
      });
    }

    // Create subscription
    await prisma.newsletterSubscription.create({
      data: {
        email,
        firstName: firstName || null,
        subscribedAt: new Date()
      }
    });

    // Send welcome email
    const emailService = new EmailService();
    await emailService.sendNewsletterWelcome(email, firstName);

    res.json({
      success: true,
      message: 'Inscription à la newsletter réussie ! Vérifiez votre email.'
    });
  } catch (error) {
    console.error('Erreur inscription newsletter:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'inscription à la newsletter'
    });
  }
});

// Gains pour admin (detailed info)
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

// Analytics endpoints
app.get('/api/admin/analytics/stats', authMiddleware, roleMiddleware(['ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    // Page views
    const pageViews = await prisma.analytics.count({
      where: { eventType: 'page_view' }
    });

    // Newsletter subscriptions
    const newsletterSubscriptions = await prisma.newsletterSubscription.count();

    // CTA clicks
    const ctaClicks = await prisma.analytics.count({
      where: { eventType: 'cta_click' }
    });

    // Conversion rate (participations vs page views)
    const totalParticipations = await prisma.participation.count();
    const conversionRate = pageViews > 0 ? ((totalParticipations / pageViews) * 100).toFixed(2) : '0';

    res.json({
      success: true,
      data: {
        pageViews,
        newsletterSubscriptions,
        ctaClicks,
        totalParticipations,
        conversionRate: parseFloat(conversionRate)
      }
    });
  } catch (error) {
    console.error('Analytics stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques analytics'
    });
  }
});

app.get('/api/admin/analytics/top-pages', authMiddleware, roleMiddleware(['ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const topPages = await prisma.analytics.groupBy({
      by: ['eventData'],
      where: { eventType: 'page_view' },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10
    });

    const formattedPages = topPages.map((page: any) => ({
      page: JSON.parse(page.eventData as string).page || 'Unknown',
      views: page._count.id
    }));

    res.json({
      success: true,
      data: formattedPages
    });
  } catch (error) {
    console.error('Top pages error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des pages populaires'
    });
  }
});

app.get('/api/admin/analytics/cta-performance', authMiddleware, roleMiddleware(['ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const ctaPerformance = await prisma.analytics.groupBy({
      by: ['eventData'],
      where: { eventType: 'cta_click' },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } }
    });

    const formattedData = ctaPerformance.map((item: any) => {
      const data = JSON.parse(item.eventData as string);
      return {
        ctaName: data.ctaName || 'CTA inconnu',
        clicks: item._count.id,
        location: data.location || 'Non spécifié'
      };
    });

    res.json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    console.error('CTA performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des performances CTA'
    });
  }
});

app.get('/api/admin/analytics/conversion-funnel', authMiddleware, roleMiddleware(['ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    // Get page views on auth page (registration intent)
    const authPageViews = await prisma.analytics.count({
      where: {
        eventType: 'page_view',
        eventData: {
          path: ['page'],
          equals: 'auth_page'
        }
      }
    });

    // Get total registrations
    const totalRegistrations = await prisma.user.count();

    // Get users who participated after registration
    const usersWithParticipations = await prisma.user.count({
      where: {
        participations: {
          some: {}
        }
      }
    });

    // Get total participations
    const totalParticipations = await prisma.participation.count();

    // Get claimed prizes
    const claimedPrizes = await prisma.participation.count({
      where: { isClaimed: true }
    });

    // Calculate conversion rates
    const registrationRate = authPageViews > 0 ? ((totalRegistrations / authPageViews) * 100).toFixed(2) : '0';
    const participationRate = totalRegistrations > 0 ? ((usersWithParticipations / totalRegistrations) * 100).toFixed(2) : '0';
    const claimRate = totalParticipations > 0 ? ((claimedPrizes / totalParticipations) * 100).toFixed(2) : '0';

    // Get daily objectives (mock data - you can make this configurable)
    const dailyObjectives = {
      registrations: 50,
      participations: 30,
      claims: 20
    };

    // Calculate today's progress
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayRegistrations = await prisma.user.count({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    const todayParticipations = await prisma.participation.count({
      where: {
        participationDate: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    const todayClaims = await prisma.participation.count({
      where: {
        claimedAt: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    res.json({
      success: true,
      data: {
        funnel: {
          authPageViews,
          totalRegistrations,
          usersWithParticipations,
          totalParticipations,
          claimedPrizes
        },
        conversionRates: {
          registrationRate: parseFloat(registrationRate),
          participationRate: parseFloat(participationRate),
          claimRate: parseFloat(claimRate)
        },
        objectives: dailyObjectives,
        todayProgress: {
          registrations: todayRegistrations,
          participations: todayParticipations,
          claims: todayClaims
        }
      }
    });
  } catch (error) {
    console.error('Conversion funnel error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du funnel de conversion'
    });
  }
});

app.post('/api/analytics/track', async (req: Request, res: Response) => {
  try {
    const { eventType, eventData, userId, sessionId } = req.body;

    if (!eventType) {
      return res.status(400).json({
        success: false,
        message: 'Type d\'événement requis'
      });
    }

    await prisma.analytics.create({
      data: {
        eventType,
        eventData: JSON.stringify(eventData),
        userId: userId || null,
        sessionId: sessionId || null,
        ipAddress: req.ip || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown'
      }
    });

    res.json({
      success: true,
      message: 'Événement tracké avec succès'
    });
  } catch (error) {
    console.error('Analytics tracking error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du tracking'
    });
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
          select: { firstName: true, lastName: true, email: true, phone: true }
        },
        gain: {
          select: { name: true, value: true }
        },
        code: {
          select: { code: true }
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
          select: { firstName: true, lastName: true, email: true, phone: true }
        },
        gain: {
          select: { name: true, value: true }
        },
        code: {
          select: { code: true }
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

// Vérifier s'il y a déjà eu un tirage
app.get('/api/admin/grand-tirage/status', authMiddleware, roleMiddleware(['ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const existingDraw = await prisma.grandTirage.findFirst({
      where: { isActive: true },
      include: { winner: true }
    });

    const totalParticipants = await prisma.user.count({
      where: {
        participations: {
          some: {}
        }
      }
    });

    res.json({
      hasDrawn: !!existingDraw,
      totalParticipants,
      draw: existingDraw ? {
        id: existingDraw.id,
        winner: {
          id: existingDraw.winner.id,
          name: `${existingDraw.winner.firstName} ${existingDraw.winner.lastName}`,
          email: existingDraw.winner.email
        },
        drawDate: existingDraw.drawDate,
        totalParticipants: existingDraw.totalParticipants
      } : null
    });
  } catch (error) {
    console.error('Erreur statut tirage:', error);
    res.status(500).json({ error: 'Erreur lors de la vérification du statut' });
  }
});

// Lancer le grand tirage au sort
app.post('/api/admin/grand-tirage', authMiddleware, roleMiddleware(['ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    // Vérifier s'il y a déjà eu un tirage
    const existingDraw = await prisma.grandTirage.findFirst({
      where: { isActive: true }
    });

    if (existingDraw) {
      return res.status(400).json({ error: 'Un tirage au sort a déjà été effectué' });
    }

    // Récupérer tous les participants uniques (1 chance par personne)
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

    // Enregistrer le résultat du tirage
    const grandTirage = await prisma.grandTirage.create({
      data: {
        winnerId: winner.id,
        totalParticipants: participants.length,
        conductedBy: req.user.id,
        isActive: true
      },
      include: { winner: true }
    });

    res.json({
      success: true,
      draw: {
        id: grandTirage.id,
        winner: {
          id: winner.id,
          name: `${winner.firstName} ${winner.lastName}`,
          email: winner.email
        },
        totalParticipants: participants.length,
        drawDate: grandTirage.drawDate,
        conductedBy: req.user.email
      }
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
const PORT = parseInt(process.env.PORT || '3002', 10);
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 API démarrée sur le port ${PORT}`);
  console.log(`📊 Environnement: ${process.env.NODE_ENV || 'development'}`);
});