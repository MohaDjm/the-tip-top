"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dotenv_1 = __importDefault(require("dotenv"));
const ioredis_1 = __importDefault(require("ioredis"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
const redis = new ioredis_1.default(process.env.REDIS_URL || 'redis://localhost:6379');
// Middleware de sécurité
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true
}));
app.use((0, compression_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)('combined'));
// Rate limiting pour prévenir les abus
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limite de 100 requêtes
    message: 'Trop de requêtes, veuillez réessayer plus tard'
});
app.use('/api/', limiter);
const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Token manquant' });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secret');
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId }
        });
        if (!user) {
            return res.status(401).json({ error: 'Utilisateur non trouvé' });
        }
        req.user = user;
        next();
    }
    catch (error) {
        return res.status(401).json({ error: 'Token invalide' });
    }
};
// Middleware pour vérifier les rôles
const roleMiddleware = (roles) => {
    return (req, res, next) => {
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
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, firstName, lastName, phone, address, city, postalCode, dateOfBirth } = req.body;
        // Vérifier si l'utilisateur existe
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Email déjà utilisé' });
        }
        // Hasher le mot de passe
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        // Créer l'utilisateur
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                phone,
                address,
                city,
                postalCode,
                dateOfBirth: new Date(dateOfBirth),
                role: 'CLIENT'
            }
        });
        // Générer un token
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
        res.json({ token, user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName } });
    }
    catch (error) {
        console.error('Erreur inscription:', error);
        res.status(500).json({ error: 'Erreur lors de l\'inscription' });
    }
});
// Connexion
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        // Trouver l'utilisateur
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password) {
            return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
        }
        // Vérifier le mot de passe
        const validPassword = await bcryptjs_1.default.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
        }
        // Générer un token
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
        res.json({ token, user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role } });
    }
    catch (error) {
        console.error('Erreur connexion:', error);
        res.status(500).json({ error: 'Erreur lors de la connexion' });
    }
});
// SSO Google/Facebook (endpoint à intégrer avec NextAuth)
app.post('/api/auth/social', async (req, res) => {
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
        }
        else {
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
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
        res.json({ token, user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName } });
    }
    catch (error) {
        console.error('Erreur auth sociale:', error);
        res.status(500).json({ error: 'Erreur lors de l\'authentification sociale' });
    }
});
// ===========================
// ROUTES DE PARTICIPATION
// ===========================
// Valider un code et participer
app.post('/api/participation/validate', authMiddleware, async (req, res) => {
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
    }
    catch (error) {
        console.error('Erreur validation code:', error);
        res.status(500).json({ error: 'Erreur lors de la validation du code' });
    }
});
// Récupérer l'historique des participations
app.get('/api/participation/history', authMiddleware, async (req, res) => {
    try {
        const participations = await prisma.participation.findMany({
            where: { userId: req.user.id },
            include: { gain: true, code: true },
            orderBy: { participationDate: 'desc' }
        });
        res.json(participations);
    }
    catch (error) {
        console.error('Erreur récupération historique:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération de l\'historique' });
    }
});
// ===========================
// ROUTES POUR LES CAISSES
// ===========================
// Endpoint pour les caisses - Vérifier si un code est valide
app.post('/api/caisse/verify-code', async (req, res) => {
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
    }
    catch (error) {
        console.error('Erreur vérification code caisse:', error);
        res.status(500).json({ error: 'Erreur lors de la vérification' });
    }
});
// ===========================
// ROUTES EMPLOYÉS
// ===========================
// Rechercher un gain client
app.post('/api/employee/search-gain', authMiddleware, roleMiddleware(['EMPLOYEE', 'ADMIN']), async (req, res) => {
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
        }
        else {
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
    }
    catch (error) {
        console.error('Erreur recherche gain:', error);
        res.status(500).json({ error: 'Erreur lors de la recherche' });
    }
});
// Marquer un gain comme remis
app.post('/api/employee/mark-claimed', authMiddleware, roleMiddleware(['EMPLOYEE', 'ADMIN']), async (req, res) => {
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
    }
    catch (error) {
        console.error('Erreur marquage gain:', error);
        res.status(500).json({ error: 'Erreur lors du marquage' });
    }
});
// ===========================
// ROUTES ADMINISTRATION
// ===========================
// Statistiques générales
app.get('/api/admin/stats', authMiddleware, roleMiddleware(['ADMIN']), async (req, res) => {
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
        // Démographie (exemple simplifié)
        const ageGroups = await prisma.$queryRaw `
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
    `;
        res.json({
            global: {
                totalCodes,
                usedCodes,
                participationRate: ((usedCodes / totalCodes) * 100).toFixed(2),
                totalParticipations,
                claimedGains
            },
            gains: gainStats.map(gain => ({
                name: gain.name,
                totalQuantity: gain.quantity,
                distributed: gain._count.participations,
                remaining: gain.remainingQuantity,
                percentage: ((gain._count.participations / gain.quantity) * 100).toFixed(2)
            })),
            demographics: {
                ageGroups
            }
        });
    }
    catch (error) {
        console.error('Erreur statistiques:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
    }
});
// Export des emails pour campagne marketing
app.get('/api/admin/export-emails', authMiddleware, roleMiddleware(['ADMIN']), async (req, res) => {
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
            users.map(u => `${u.email},${u.firstName},${u.lastName},${u.createdAt.toISOString()},${u._count.participations}`).join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="export_emails.csv"');
        res.send(csv);
    }
    catch (error) {
        console.error('Erreur export emails:', error);
        res.status(500).json({ error: 'Erreur lors de l\'export' });
    }
});
// ===========================
// TIRAGE AU SORT FINAL
// ===========================
app.post('/api/admin/grand-tirage', authMiddleware, roleMiddleware(['ADMIN']), async (req, res) => {
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
    }
    catch (error) {
        console.error('Erreur tirage au sort:', error);
        res.status(500).json({ error: 'Erreur lors du tirage au sort' });
    }
});
// Health check pour le monitoring
app.get('/api/health', async (req, res) => {
    try {
        await prisma.$queryRaw `SELECT 1`;
        await redis.ping();
        res.json({ status: 'OK', timestamp: new Date().toISOString() });
    }
    catch (error) {
        res.status(500).json({ status: 'ERROR', error: error });
    }
});
// Démarrage du serveur
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 API démarrée sur le port ${PORT}`);
    console.log(`📊 Environnement: ${process.env.NODE_ENV || 'development'}`);
});
//# sourceMappingURL=app.js.map