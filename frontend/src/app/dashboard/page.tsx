'use client';

import { useState, useEffect } from 'react';
import Navigation from '../../components/Navigation';
import PrizeWheel from '../../components/PrizeWheel';
import { apiCall } from '@/lib/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface Participation {
  id: string;
  participationDate: string;
  gain: {
    name: string;
    value: number;
    description: string;
  };
  code: {
    code: string;
  };
  isClaimed: boolean;
  claimedAt?: string;
}

export default function DashboardPage() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'new'>('all');
  const [activeMenuItem, setActiveMenuItem] = useState('participations');
  const [user, setUser] = useState<User | null>(null);
  const [participations, setParticipations] = useState<Participation[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCode, setNewCode] = useState('');
  const [validatedCode, setValidatedCode] = useState('');
  const [showWheel, setShowWheel] = useState(false);
  const [wheelPrize, setWheelPrize] = useState('');

  useEffect(() => {
    // Check authentication and load user data
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      window.location.href = '/auth';
      return;
    }

    try {
      setUser(JSON.parse(userData));
      loadParticipations(token);
    } catch (error) {
      console.error('Error parsing user data:', error);
      window.location.href = '/auth';
    }
  }, []);

  const loadParticipations = async (token: string) => {
    try {
      const data = await apiCall('/participation/history', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setParticipations(data);
    } catch (error) {
      console.error('Error loading participations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    const codeToValidate = newCode.toUpperCase().trim();

    try {
      // 1. Vérifier le code d'abord (sans le marquer comme utilisé)
      const checkData = await apiCall('/participation/check-code', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: codeToValidate }),
      });

      // 2. Sauvegarder le code pour l'utiliser après l'animation
      setValidatedCode(codeToValidate);
      
      // 3. Afficher la roue avec le gain
      setWheelPrize(checkData.gain.name);
      setShowWheel(true);
      setNewCode('');

    } catch (error) {
      console.error('Error validating code:', error);
      // Ne pas afficher d'alert pour toutes les erreurs - laisser la roue gérer les codes valides
      if (error instanceof Error && error.message.includes('déjà été utilisé')) {
        alert(error.message);
      } else {
        console.log('Code validation failed, but not showing alert - might be valid code');
      }
    }
  };

  const userStats = {
    name: user?.firstName || 'Utilisateur',
    memberSince: '2024',
    participations: participations.length,
    gainsWon: participations.filter(p => p.isClaimed).length,
    totalValue: participations.filter(p => p.isClaimed).reduce((sum, p) => sum + p.gain.value, 0)
  };

  const filteredParticipations = participations.filter(participation => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'new') return !participation.isClaimed;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2C5545] mx-auto mb-4"></div>
          <p className="text-[#2C5545] font-['Lato']">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
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
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-[#F5F1E6] rounded-lg p-3 min-h-[4rem] flex flex-col justify-center">
                  <div className="text-lg font-bold text-[#2C5545]">{userStats.participations}</div>
                  <div className="text-xs text-gray-600 font-['Lato'] leading-tight">Participations</div>
                </div>
                <div className="bg-[#F5F1E6] rounded-lg p-3 min-h-[4rem] flex flex-col justify-center">
                  <div className="text-lg font-bold text-[#2C5545]">{userStats.gainsWon}</div>
                  <div className="text-xs text-gray-600 font-['Lato'] leading-tight">Gains</div>
                </div>
                <div className="bg-[#F5F1E6] rounded-lg p-3 min-h-[4rem] flex flex-col justify-center">
                  <div className="text-lg font-bold text-[#D4B254]">{userStats.totalValue}€</div>
                  <div className="text-xs text-gray-600 font-['Lato']">Total</div>
                </div>
              </div>
            </div>
          </div>

          {/* Menu */}
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setActiveMenuItem('participations')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-['Lato'] font-medium transition-all duration-200 ${
                    activeMenuItem === 'participations'
                      ? 'bg-[#2C5545] text-white shadow-md'
                      : 'text-gray-700 hover:bg-[#F5F1E6] hover:text-[#2C5545]'
                  }`}
                >
                  <span className="text-lg">🎯</span>
                  <span className="text-sm">Mes participations</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveMenuItem('prizes')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-['Lato'] font-medium transition-all duration-200 ${
                    activeMenuItem === 'prizes'
                      ? 'bg-[#2C5545] text-white shadow-md'
                      : 'text-gray-700 hover:bg-[#F5F1E6] hover:text-[#2C5545]'
                  }`}
                >
                  <span className="text-lg">🏆</span>
                  <span className="text-sm">Mes gains obtenus</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveMenuItem('profile')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-['Lato'] font-medium transition-all duration-200 ${
                    activeMenuItem === 'profile'
                      ? 'bg-[#2C5545] text-white shadow-md'
                      : 'text-gray-700 hover:bg-[#F5F1E6] hover:text-[#2C5545]'
                  }`}
                >
                  <span className="text-lg">👤</span>
                  <span className="text-sm">Mes informations personnelles</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveMenuItem('referral')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-['Lato'] font-medium transition-all duration-200 ${
                    activeMenuItem === 'referral'
                      ? 'bg-[#2C5545] text-white shadow-md'
                      : 'text-gray-700 hover:bg-[#F5F1E6] hover:text-[#2C5545]'
                  }`}
                >
                  <span className="text-lg">🤝</span>
                  <span className="text-sm">Programme de parrainage</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveMenuItem('notifications')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-['Lato'] font-medium transition-all duration-200 ${
                    activeMenuItem === 'notifications'
                      ? 'bg-[#2C5545] text-white shadow-md'
                      : 'text-gray-700 hover:bg-[#F5F1E6] hover:text-[#2C5545]'
                  }`}
                >
                  <span className="text-lg">🔔</span>
                  <span className="text-sm">Préférences de notifications</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveMenuItem('history')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-['Lato'] font-medium transition-all duration-200 ${
                    activeMenuItem === 'history'
                      ? 'bg-[#2C5545] text-white shadow-md'
                      : 'text-gray-700 hover:bg-[#F5F1E6] hover:text-[#2C5545]'
                  }`}
                >
                  <span className="text-lg">📋</span>
                  <span className="text-sm">Historique des achats</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            {/* Dynamic Content Based on Active Menu Item */}
            {activeMenuItem === 'participations' && (
              <>
                {/* Header */}
                <div className="mb-8">
                  <h1 className="font-['Playfair_Display'] text-3xl font-bold text-[#2C5545] mb-2">
                    MES PARTICIPATIONS AU JEU-CONCOURS
                  </h1>
                  <p className="text-gray-600 font-['Lato']">
                    Retrouvez toutes vos participations et suivez l&apos;état de vos gains
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
              {filteredParticipations.map((participation) => (
                <div
                  key={participation.id}
                  className="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-all duration-300 border border-gray-100"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Date Badge */}
                      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <span className="text-2xl">🎫</span>
                              <div>
                                <h3 className="font-['Playfair_Display'] text-lg font-semibold text-[#2C5545]">
                                  Code: {participation.code?.code || 'N/A'}
                                </h3>
                                <p className="text-sm text-gray-500 font-['Lato']">
                                  {new Date(participation.participationDate).toLocaleDateString('fr-FR')}
                                </p>
                              </div>
                            </div>
                            
                            <div className="bg-[#F5F1E6] rounded-lg p-4 mb-3">
                              <h4 className="font-['Lato'] font-semibold text-[#2C5545] mb-1">
                                {participation.gain.name}
                              </h4>
                              <p className="text-sm text-gray-600 font-['Lato']">
                                {participation.gain.value > 0 ? `Valeur: ${participation.gain.value}€` : 'Cadeau offert'}
                              </p>
                              <p className="text-xs text-gray-500 font-['Lato'] mt-1">
                                {participation.gain.description}
                              </p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            {!participation.isClaimed && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mb-2">
                                🆕 À récupérer
                              </span>
                            )}
                            {participation.isClaimed ? (
                              <div>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mb-1">
                                  ✅ Récupéré
                                </span>
                                {participation.claimedAt && (
                                  <p className="text-xs text-gray-500 font-['Lato']">
                                    {new Date(participation.claimedAt).toLocaleDateString('fr-FR')}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <button className="bg-[#D4B254] hover:bg-[#c4a244] text-white px-4 py-2 rounded-lg font-['Lato'] font-medium text-sm transition-colors duration-200">
                                Récupérer en boutique
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Referral Section */}
            <div className="bg-gradient-to-r from-[#2C5545] to-[#1a3329] rounded-xl p-8 text-white">
              <div className="flex items-center justify-between">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-['Playfair_Display'] text-xl font-semibold text-[#2C5545] mb-4">
                    Nouveau Code
                  </h3>
                  <p className="text-gray-600 font-['Lato'] mb-4">
                    Saisissez votre code de participation pour découvrir votre gain !
                  </p>
                  
                  <form onSubmit={handleCodeSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#2C5545] mb-2 font-['Lato']">
                        Code de participation
                      </label>
                      <input
                        type="text"
                        value={newCode}
                        onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                        placeholder="ABC123XYZ0"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#D4B254] focus:outline-none transition-colors font-['Lato'] text-center text-lg font-bold tracking-wider uppercase text-black"
                        maxLength={10}
                        required
                      />
                    </div>
                    
                    <button 
                      type="submit"
                      className="w-full bg-[#D4B254] hover:bg-[#c4a244] text-white py-3 rounded-lg font-['Lato'] font-bold text-lg transition-colors duration-200 shadow-[0_4px_12px_rgba(212,178,84,0.3)]"
                    >
                      Valider mon code
                    </button>
                  </form>
                </div>
                
                <div className="text-6xl opacity-20">
                  🎫
                </div>
              </div>
                </div>
              </>
            )}

            {/* Prizes Section */}
            {activeMenuItem === 'prizes' && (
              <div className="mb-8">
                <h1 className="font-['Playfair_Display'] text-3xl font-bold text-[#2C5545] mb-2">
                  MES GAINS OBTENUS
                </h1>
                <p className="text-gray-600 font-['Lato'] mb-6">
                  Consultez tous vos gains remportés lors de vos participations
                </p>
                
                <div className="grid gap-6">
                  {participations.filter(p => p.isClaimed).map((participation) => (
                    <div key={participation.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <span className="text-3xl">🏆</span>
                          <div>
                            <h3 className="font-['Playfair_Display'] text-lg font-semibold text-[#2C5545]">
                              {participation.gain.name}
                            </h3>
                            <p className="text-sm text-gray-500 font-['Lato']">
                              Récupéré le {new Date(participation.claimedAt!).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        </div>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          ✅ Récupéré
                        </span>
                      </div>
                    </div>
                  ))}
                  {participations.filter(p => p.isClaimed).length === 0 && (
                    <div className="text-center py-12">
                      <span className="text-6xl opacity-20">🎁</span>
                      <p className="text-gray-500 font-['Lato'] mt-4">Aucun gain récupéré pour le moment</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Profile Section */}
            {activeMenuItem === 'profile' && (
              <div className="mb-8">
                <h1 className="font-['Playfair_Display'] text-3xl font-bold text-[#2C5545] mb-2">
                  MES INFORMATIONS PERSONNELLES
                </h1>
                <p className="text-gray-600 font-['Lato'] mb-6">
                  Gérez vos informations personnelles et préférences de compte
                </p>
                
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-[#2C5545] mb-2 font-['Lato']">
                        Prénom
                      </label>
                      <input
                        type="text"
                        value={user?.firstName || ''}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#D4B254] focus:outline-none transition-colors font-['Lato'] text-black"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#2C5545] mb-2 font-['Lato']">
                        Nom
                      </label>
                      <input
                        type="text"
                        value={user?.lastName || ''}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#D4B254] focus:outline-none transition-colors font-['Lato'] text-black"
                        readOnly
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-[#2C5545] mb-2 font-['Lato']">
                        Email
                      </label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#D4B254] focus:outline-none transition-colors font-['Lato'] text-black"
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800 font-['Lato']">
                      💡 Pour modifier vos informations, contactez notre service client
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Other sections placeholders */}
            {activeMenuItem === 'referral' && (
              <div className="mb-8">
                <h1 className="font-['Playfair_Display'] text-3xl font-bold text-[#2C5545] mb-2">
                  PROGRAMME DE PARRAINAGE
                </h1>
                <p className="text-gray-600 font-['Lato'] mb-6">
                  Parrainez vos amis et gagnez des avantages exclusifs
                </p>
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
                  <span className="text-6xl opacity-20">👥</span>
                  <p className="text-gray-500 font-['Lato'] mt-4">Fonctionnalité en cours de développement</p>
                </div>
              </div>
            )}

            {activeMenuItem === 'notifications' && (
              <div className="mb-8">
                <h1 className="font-['Playfair_Display'] text-3xl font-bold text-[#2C5545] mb-2">
                  PRÉFÉRENCES DE NOTIFICATIONS
                </h1>
                <p className="text-gray-600 font-['Lato'] mb-6">
                  Gérez vos préférences de communication
                </p>
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
                  <span className="text-6xl opacity-20">🔔</span>
                  <p className="text-gray-500 font-['Lato'] mt-4">Fonctionnalité en cours de développement</p>
                </div>
              </div>
            )}

            {activeMenuItem === 'history' && (
              <div className="mb-8">
                <h1 className="font-['Playfair_Display'] text-3xl font-bold text-[#2C5545] mb-2">
                  HISTORIQUE DES ACHATS
                </h1>
                <p className="text-gray-600 font-['Lato'] mb-6">
                  Consultez l&apos;historique de vos achats en boutique
                </p>
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
                  <span className="text-6xl opacity-20">🛍️</span>
                  <p className="text-gray-500 font-['Lato'] mt-4">Fonctionnalité en cours de développement</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Prize Wheel Modal */}
      {showWheel && (
        <PrizeWheel
          targetPrize={wheelPrize}
          onComplete={async () => {
            try {
              const token = localStorage.getItem('token');
              
              // 3. Marquer le code comme utilisé après l'animation
              const claimData = await apiCall('/participation/claim', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code: validatedCode }),
              });

              console.log('Participation enregistrée:', claimData);
              // Recharger les participations pour mettre à jour l'affichage
              if (token) {
                loadParticipations(token);
              }
            } catch (error) {
              console.error('Erreur lors de la réclamation du gain:', error);
            }
          }}
          onClose={() => {
            setShowWheel(false);
            setWheelPrize('');
            // Reload participations after wheel closes
            const token = localStorage.getItem('token');
            if (token) {
              loadParticipations(token);
            }
          }}
        />
      )}
    </div>
  );
}
