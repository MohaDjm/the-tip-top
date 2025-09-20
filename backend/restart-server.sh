#!/bin/bash

echo "🔄 Redémarrage du serveur backend..."

# Arrêter tous les processus sur le port 3002
echo "🛑 Arrêt des processus sur le port 3002..."
lsof -ti:3002 | xargs kill -9 2>/dev/null || true

# Attendre un peu
sleep 2

# Arrêter PM2 backend si il existe
echo "🛑 Arrêt PM2 backend..."
pm2 stop backend 2>/dev/null || true
pm2 delete backend 2>/dev/null || true

# Nettoyer les processus Node.js qui pourraient traîner
echo "🧹 Nettoyage des processus Node.js..."
pkill -f "node dist/app.js" 2>/dev/null || true
pkill -f "npm start" 2>/dev/null || true

# Attendre un peu plus
sleep 3

# Vérifier que le port est libre
if lsof -Pi :3002 -sTCP:LISTEN -t >/dev/null ; then
    echo "❌ Le port 3002 est encore occupé"
    lsof -i :3002
    exit 1
else
    echo "✅ Le port 3002 est libre"
fi

# Construire le projet
echo "🔨 Construction du projet..."
npm run build

# Démarrer le serveur
echo "🚀 Démarrage du serveur..."
pm2 start dist/app.js --name backend --log-date-format="YYYY-MM-DD HH:mm:ss"

echo "✅ Serveur redémarré avec succès!"
echo "📊 Statut PM2:"
pm2 status

echo "📝 Logs en temps réel:"
echo "pm2 logs backend --lines 50"
