'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'new'>('all');
  const [activeMenuItem, setActiveMenuItem] = useState('participations');

  // Mock data - replace with real data from API
  const userStats = {
    name: 'Élise',
    memberSince: '2023',
    participations: 3,
    wins: 2,
    totalValue: 87
  };

  const participations = [
    {
      id: 1,
      date: '2024-01-15',
      prize: 'Infuseur à thé',
      code: 'ABC123XYZ0',
      status: 'claimed',
      icon: '🫖',
      value: 8
    },
    {
      id: 2,
      date: '2024-01-10',
      prize: 'Coffret découverte 39€',
      code: 'DEF456UVW1',
      status: 'pending',
      icon: '🎁',
      value: 39
    },
    {
      id: 3,
      date: '2024-01-05',
      prize: 'Thé signature 100g',
      code: 'GHI789RST2',
      status: 'claimed',
      icon: '⭐',
      value: 18
    }
  ];

  const menuItems = [
    { id: 'participations', label: 'Mes participations', icon: '🎯', active: true },
    { id: 'prizes', label: 'Mes gains obtenus', icon: '🏆', active: false },
    { id: 'profile', label: 'Mes informations personnelles', icon: '👤', active: false },
    { id: 'referral', label: 'Programme de parrainage', icon: '🤝', active: false },
    { id: 'notifications', label: 'Préférences de notifications', icon: '🔔', active: false },
    { id: 'history', label: 'Historique des achats', icon: '📋', active: false }
  ];

  const getStatusBadge = (status: string) => {
    if (status === 'claimed') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-['Lato'] font-medium bg-green-100 text-green-800">
          ✅ Récupéré
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-['Lato'] font-medium bg-orange-100 text-orange-800">
        ⏳ En attente
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-80 bg-white shadow-lg min-h-screen">
          <div className="p-6 border-b border-gray-200">
            {/* User Profile */}
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-[#2C5545] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">É</span>
              </div>
              <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#2C5545] mb-1">
                Bonjour {userStats.name} !
              </h2>
              <p className="text-sm font-['Lato'] text-gray-600 mb-4">
                Membre VIP depuis {userStats.memberSince}
              </p>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-[#F5F1E6] rounded-lg p-3">
                  <div className="text-lg font-bold text-[#2C5545]">{userStats.participations}</div>
                  <div className="text-xs text-gray-600 font-['Lato']">Participations</div>
                </div>
                <div className="bg-[#F5F1E6] rounded-lg p-3">
                  <div className="text-lg font-bold text-[#2C5545]">{userStats.wins}</div>
                  <div className="text-xs text-gray-600 font-['Lato']">Gains</div>
                </div>
                <div className="bg-[#F5F1E6] rounded-lg p-3">
                  <div className="text-lg font-bold text-[#D4B254]">{userStats.totalValue}€</div>
                  <div className="text-xs text-gray-600 font-['Lato']">Total</div>
                </div>
              </div>
            </div>
          </div>

          {/* Menu */}
          <nav className="p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveMenuItem(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-['Lato'] font-medium transition-all duration-200 ${
                      activeMenuItem === item.id
                        ? 'bg-[#2C5545] text-white shadow-md'
                        : 'text-gray-700 hover:bg-[#F5F1E6] hover:text-[#2C5545]'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-sm">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="font-['Playfair_Display'] text-3xl font-bold text-[#2C5545] mb-2">
                MES PARTICIPATIONS AU JEU-CONCOURS
              </h1>
              <p className="text-gray-600 font-['Lato']">
                Retrouvez toutes vos participations et suivez l'état de vos gains
              </p>
            </div>

            {/* Filters */}
            <div className="flex space-x-4 mb-6">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-6 py-2 rounded-lg font-['Lato'] font-medium transition-all duration-200 ${
                  activeFilter === 'all'
                    ? 'bg-[#2C5545] text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-[#D4B254]'
                }`}
              >
                Toutes
              </button>
              <button
                onClick={() => setActiveFilter('new')}
                className={`px-6 py-2 rounded-lg font-['Lato'] font-medium transition-all duration-200 ${
                  activeFilter === 'new'
                    ? 'bg-[#2C5545] text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-[#D4B254]'
                }`}
              >
                Nouvelles participations
              </button>
            </div>

            {/* Participations Grid */}
            <div className="grid gap-6 mb-8">
              {participations.map((participation) => (
                <div
                  key={participation.id}
                  className="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-all duration-300 border border-gray-100"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Date Badge */}
                      <div className="bg-[#2C5545] text-white px-3 py-1 rounded-lg text-sm font-['Lato'] font-medium">
                        {formatDate(participation.date)}
                      </div>
                      
                      {/* Prize Info */}
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{participation.icon}</span>
                        <div>
                          <h3 className="font-['Lato'] font-bold text-lg text-[#2C5545]">
                            {participation.prize}
                          </h3>
                          <p className="text-sm text-gray-600 font-['Lato']">
                            Code: <span className="font-mono font-medium">{participation.code}</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      {/* Value */}
                      <div className="text-right">
                        <div className="text-2xl font-bold text-[#D4B254]">
                          {participation.value}€
                        </div>
                      </div>

                      {/* Status */}
                      <div>
                        {getStatusBadge(participation.status)}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex space-x-3">
                      <button className="flex items-center space-x-2 px-4 py-2 bg-[#F5F1E6] hover:bg-[#D4B254] hover:text-white text-[#2C5545] rounded-lg font-['Lato'] font-medium transition-all duration-200">
                        <span>📱</span>
                        <span>Afficher QR code</span>
                      </button>
                      <button className="flex items-center space-x-2 px-4 py-2 bg-[#F5F1E6] hover:bg-[#D4B254] hover:text-white text-[#2C5545] rounded-lg font-['Lato'] font-medium transition-all duration-200">
                        <span>👁️</span>
                        <span>Voir détails</span>
                      </button>
                      <button className="flex items-center space-x-2 px-4 py-2 bg-[#F5F1E6] hover:bg-[#D4B254] hover:text-white text-[#2C5545] rounded-lg font-['Lato'] font-medium transition-all duration-200">
                        <span>📞</span>
                        <span>Contacter boutique</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Referral Section */}
            <div className="bg-gradient-to-r from-[#2C5545] to-[#1a3329] rounded-xl p-8 text-white">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-['Playfair_Display'] text-2xl font-bold mb-2">
                    Programme de Parrainage
                  </h3>
                  <p className="font-['Lato'] text-lg mb-4 opacity-90">
                    Partagez votre code et gagnez 5€ pour chaque ami inscrit
                  </p>
                  
                  {/* Referral Code */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 inline-block">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-['Lato'] opacity-75">Votre code :</span>
                      <span className="font-mono text-xl font-bold text-[#D4B254] tracking-wider">
                        ELISE2024
                      </span>
                      <button className="ml-2 px-3 py-1 bg-[#D4B254] text-black rounded font-['Lato'] font-medium text-sm hover:bg-[#B8A049] transition-colors">
                        Copier
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="text-6xl opacity-20">
                  🎫
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
