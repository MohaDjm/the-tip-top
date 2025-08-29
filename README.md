# Thé Tip Top - Jeu Concours "10 ans, 10 boutiques, 100% gagnant"

<!-- Employee page fixes deployed -->🎯 Description du Projet

Thé Tip Top est une application web de jeu-concours de loterie développée pour une boutique de thé. L'application permet aux clients de participer à un tirage au sort en saisissant des codes uniques trouvés sur leurs achats, avec la possibilité de gagner différents prix.

## 🏗️ Architecture Technique

### Stack Technologique
- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js, TypeScript
- **Base de données**: PostgreSQL avec Prisma ORM
- **Cache**: Redis
- **Authentification**: JWT (JSON Web Tokens)
- **Reverse Proxy**: Nginx
- **Déploiement**: VPS Contabo avec Docker

### Structure du Projet
```
the-tip-top/
├── frontend/          # Application Next.js
├── backend/           # API Express.js
├── database/          # Scripts de migration
├── docker/            # Configuration Docker
└── docs/              # Documentation
```

## 🚀 Liens de Production

### Application Principale
- **Site Web**: http://164.68.103.88/
- **API Health Check**: http://164.68.103.88/api/health

### Outils d'Administration
- **Base de Données (Prisma Studio)**: http://164.68.103.88:5555/
- **API Documentation**: http://164.68.103.88/api/docs (si disponible)

## 🎮 Fonctionnalités

### Pour les Utilisateurs
- ✅ Inscription et connexion sécurisée
- ✅ Validation de codes de loterie (500,000 codes uniques)
- ✅ Consultation de l'historique des participations
- ✅ Affichage des gains remportés
- ✅ Interface responsive et moderne

### Pour les Administrateurs
- ✅ Gestion des utilisateurs
- ✅ Statistiques des participations
- ✅ Gestion des gains et prix
- ✅ Monitoring des codes utilisés

## 🎲 Système de Loterie

### Types de Gains Disponibles
1. **Infuseur à thé** - 39€ (gain le plus fréquent)
2. **Boîte de thé détox ou d'infusion** - 69€
3. **Coffret découverte** - 39€
4. **Coffret découverte** - 69€
5. **Thé signature** - 100€

### Codes de Test Valides
- `3668559563`
- `0727931754`
- `8163873221`
- `9238993595`
- `5754186939`

*Note: Ces codes retournent tous le gain "Infuseur à thé" (39€)*

## 👥 Comptes de Test

### Utilisateur Client
- **Email**: `test@thetiptop.fr`
- **Mot de passe**: `TestPassword123!`
- **Rôle**: Client standard

### Autres Comptes de Test
- **Email**: `client@thetiptop.fr`
- **Mot de passe**: `ClientPassword123!`
- **Rôle**: Client

*Note: Les identifiants administrateur ne sont pas inclus dans cette documentation pour des raisons de sécurité.*

## 🛠️ Installation et Développement Local

### Prérequis
- Node.js 18+
- PostgreSQL 16+
- Redis
- Git

### Configuration Locale

1. **Cloner le projet**
```bash
git clone https://github.com/votre-repo/the-tip-top.git
cd the-tip-top
```

2. **Configuration Backend**
```bash
cd backend
npm install
cp .env.example .env
# Configurer les variables d'environnement
npm run build
npm run dev
```

3. **Configuration Frontend**
```bash
cd frontend
npm install
cp .env.example .env.local
# Configurer les variables d'environnement
npm run dev
```

4. **Base de Données**
```bash
cd backend
npx prisma migrate dev
npx prisma db seed
```

### Variables d'Environnement

#### Backend (.env)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/thetiptop"
JWT_SECRET="your-jwt-secret"
JWT_REFRESH_SECRET="your-refresh-secret"
REDIS_URL="redis://localhost:6379"
PORT=3002
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL="http://localhost:3002/api"
NEXTAUTH_SECRET="your-nextauth-secret"
```

## 🚀 Déploiement Production

### Commandes de Déploiement VPS
```bash
# Connexion au serveur
ssh root@164.68.103.88

# Mise à jour du code
cd /root/the-tip-top
git pull origin main

# Build et redémarrage backend
cd backend
npm install
npm run build
pkill -f "node dist/app.js"
nohup npm start > backend.log 2>&1 &

# Build et redémarrage frontend
cd ../frontend
npm install
npm run build
pkill -f "next start"
nohup npm start > frontend.log 2>&1 &

# Redémarrage Nginx
systemctl restart nginx
```

### Ports Utilisés
- **Frontend**: 3001 (interne)
- **Backend**: 3002 (interne)
- **Nginx**: 80 (externe)
- **PostgreSQL**: 5432
- **Redis**: 6379
- **Prisma Studio**: 5555

## 🧪 Tests

### Lancer les Tests
```bash
# Tests Backend
cd backend
npm test

# Tests Frontend
cd frontend
npm test

# Tests E2E
npm run test:e2e
```

### Couverture de Code
- Tests unitaires pour l'authentification
- Tests d'intégration pour l'API
- Tests de validation des codes
- Tests des participations

## 📊 Base de Données

### Modèles Principaux
- **User**: Utilisateurs (clients et administrateurs)
- **Code**: 500,000 codes de loterie uniques
- **Gain**: Types de prix disponibles
- **Participation**: Historique des participations
- **Employee**: Gestion des employés (si applicable)

### Accès à la Base de Données
- **Prisma Studio**: http://164.68.103.88:5555/
- **Connexion directe**: PostgreSQL sur le port 5432

## 🔐 Sécurité

### Mesures Implémentées
- ✅ Authentification JWT avec refresh tokens
- ✅ Validation des entrées utilisateur
- ✅ Protection CORS configurée
- ✅ Hashage des mots de passe (bcrypt)
- ✅ Rate limiting sur les API
- ✅ Validation des codes anti-fraude

## 📈 Monitoring et Logs

### Fichiers de Logs
- Backend: `/root/the-tip-top/backend/backend.log`
- Frontend: `/root/the-tip-top/frontend/frontend.log`
- Nginx: `/var/log/nginx/access.log`

### Commandes de Monitoring
```bash
# Vérifier les services
ps aux | grep node
netstat -tlnp | grep -E "(3001|3002)"

# Consulter les logs
tail -f backend/backend.log
tail -f frontend/frontend.log
```

## 🤝 Contribution

### Workflow Git
1. Créer une branche feature
2. Développer et tester localement
3. Créer une Pull Request
4. Review et merge
5. Déploiement automatique

### Standards de Code
- ESLint + Prettier configurés
- TypeScript strict mode
- Tests obligatoires pour les nouvelles fonctionnalités
- Documentation des API

## 📞 Support

### Contacts Techniques
- **Développement**: Équipe technique
- **Déploiement**: DevOps
- **Base de données**: DBA

### Ressources Utiles
- [Documentation Prisma](https://www.prisma.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Guide](https://expressjs.com/)

---

## 🎉 Statut du Projet

**✅ PRODUCTION - FULLY OPERATIONAL**

L'application Thé Tip Top est entièrement fonctionnelle et déployée en production. Tous les services sont opérationnels et les 500,000 codes de loterie sont prêts à être utilisés.

**Dernière mise à jour**: Août 2025
