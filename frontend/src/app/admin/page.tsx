'use client';

import { useState } from 'react';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Mock data - replace with real data from API
  const dashboardStats = {
    totalUsers: 15420,
    totalParticipations: 8750,
    totalCodes: 500000,
    usedCodes: 8750,
    claimedPrizes: 6200,
    totalValue: 245000
  };

  const recentParticipations = [
    { id: 1, user: 'Marie Dubois', email: 'marie@email.com', prize: 'Infuseur à thé', date: '2024-01-20', status: 'pending' },
    { id: 2, user: 'Pierre Martin', email: 'pierre@email.com', prize: 'Coffret 39€', date: '2024-01-20', status: 'claimed' },
    { id: 3, user: 'Sophie Laurent', email: 'sophie@email.com', prize: 'Thé signature', date: '2024-01-19', status: 'pending' },
    { id: 4, user: 'Jean Moreau', email: 'jean@email.com', prize: 'Thé détox', date: '2024-01-19', status: 'claimed' },
    { id: 5, user: 'Claire Bernard', email: 'claire@email.com', prize: 'Coffret 69€', date: '2024-01-18', status: 'pending' }
  ];

  const gains = [
    { id: 1, name: 'Infuseur à thé', value: 8, quantity: 300000, remaining: 291250, percentage: 60 },
    { id: 2, name: 'Thé détox 100g', value: 12, quantity: 100000, remaining: 98250, percentage: 20 },
    { id: 3, name: 'Thé signature 100g', value: 18, quantity: 50000, remaining: 49125, percentage: 10 },
    { id: 4, name: 'Coffret découverte 39€', value: 39, quantity: 30000, remaining: 29475, percentage: 6 },
    { id: 5, name: 'Coffret premium 69€', value: 69, quantity: 20000, remaining: 19900, percentage: 4 }
  ];

  const getStatusBadge = (status: string) => {
    if (status === 'claimed') {
      return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Récupéré</span>;
    }
    return <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">En attente</span>;
  };

  const StatCard = ({ title, value, subtitle, color = 'bg-white' }: any) => (
    <div className={`${color} rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]`}>
      <h3 className="font-['Lato'] text-sm font-medium text-gray-600 mb-2">{title}</h3>
      <div className="font-['Playfair_Display'] text-3xl font-bold text-[#2C5545] mb-1">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      {subtitle && <p className="text-sm text-gray-500 font-['Lato']">{subtitle}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🍃</span>
                <h1 className="font-['Playfair_Display'] text-2xl font-bold text-[#2C5545]">Thé Tip Top</h1>
              </div>
              <div className="h-6 w-px bg-gray-300"></div>
              <span className="font-['Lato'] text-lg text-gray-600">Administration</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="font-['Lato'] font-medium text-[#2C5545]">Admin</div>
                <div className="text-sm text-gray-500">Connecté</div>
              </div>
              <div className="w-10 h-10 bg-[#2C5545] rounded-full flex items-center justify-center">
                <span className="text-white font-bold">A</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-100 rounded-lg p-1">
          {[
            { id: 'dashboard', label: 'Tableau de bord', icon: '📊' },
            { id: 'participations', label: 'Participations', icon: '🎯' },
            { id: 'users', label: 'Utilisateurs', icon: '👥' },
            { id: 'gains', label: 'Gestion des gains', icon: '🎁' },
            { id: 'codes', label: 'Codes', icon: '🔢' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md font-['Lato'] font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-white text-[#2C5545] shadow-sm'
                  : 'text-gray-600 hover:text-[#2C5545]'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Utilisateurs inscrits"
                value={dashboardStats.totalUsers}
                subtitle="+12% ce mois"
                color="bg-gradient-to-br from-blue-50 to-blue-100"
              />
              <StatCard
                title="Participations totales"
                value={dashboardStats.totalParticipations}
                subtitle="Taux: 56.8%"
                color="bg-gradient-to-br from-green-50 to-green-100"
              />
              <StatCard
                title="Codes utilisés"
                value={`${dashboardStats.usedCodes}/${dashboardStats.totalCodes}`}
                subtitle={`${((dashboardStats.usedCodes / dashboardStats.totalCodes) * 100).toFixed(1)}% utilisés`}
                color="bg-gradient-to-br from-purple-50 to-purple-100"
              />
              <StatCard
                title="Valeur totale distribuée"
                value={`${(dashboardStats.totalValue / 1000).toFixed(0)}k€`}
                subtitle="Prix réclamés"
                color="bg-gradient-to-br from-yellow-50 to-yellow-100"
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Participation Chart */}
              <div className="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                <h3 className="font-['Playfair_Display'] text-xl font-bold text-[#2C5545] mb-4">
                  Participations par jour
                </h3>
                <div className="h-64 flex items-end justify-between space-x-2">
                  {[120, 150, 180, 200, 175, 220, 190].map((height, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-[#D4B254] rounded-t-md transition-all duration-500 hover:bg-[#2C5545]"
                        style={{ height: `${(height / 220) * 100}%` }}
                      ></div>
                      <span className="text-xs text-gray-500 mt-2 font-['Lato']">
                        {new Date(Date.now() - (6 - index) * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR', { weekday: 'short' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prize Distribution */}
              <div className="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                <h3 className="font-['Playfair_Display'] text-xl font-bold text-[#2C5545] mb-4">
                  Répartition des gains
                </h3>
                <div className="space-y-4">
                  {gains.map((gain, index) => (
                    <div key={gain.id} className="flex items-center space-x-4">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: `hsl(${index * 60}, 70%, 50%)` }}></div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-['Lato'] font-medium text-sm">{gain.name}</span>
                          <span className="text-sm text-gray-500">{gain.percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all duration-500"
                            style={{
                              width: `${gain.percentage}%`,
                              backgroundColor: `hsl(${index * 60}, 70%, 50%)`
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Participations */}
            <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
              <div className="p-6 border-b border-gray-200">
                <h3 className="font-['Playfair_Display'] text-xl font-bold text-[#2C5545]">
                  Participations récentes
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-['Lato'] font-medium text-gray-500 uppercase tracking-wider">
                        Utilisateur
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-['Lato'] font-medium text-gray-500 uppercase tracking-wider">
                        Gain
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-['Lato'] font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-['Lato'] font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentParticipations.map((participation) => (
                      <tr key={participation.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="font-['Lato'] font-medium text-[#2C5545]">{participation.user}</div>
                            <div className="text-sm text-gray-500">{participation.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-['Lato'] text-sm text-gray-900">
                          {participation.prize}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-['Lato'] text-sm text-gray-500">
                          {new Date(participation.date).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(participation.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Gains Management Tab */}
        {activeTab === 'gains' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#2C5545]">
                Gestion des gains
              </h2>
              <button className="bg-[#2C5545] hover:bg-[#1a3329] text-white px-6 py-3 rounded-lg font-['Lato'] font-bold transition-all duration-200">
                + NOUVEAU GAIN
              </button>
            </div>

            <div className="grid gap-6">
              {gains.map((gain) => (
                <div key={gain.id} className="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-['Lato'] font-bold text-lg text-[#2C5545]">{gain.name}</h3>
                      <p className="text-sm text-gray-600">Valeur: {gain.value}€</p>
                    </div>
                    <div className="flex space-x-2">
                      <button className="px-4 py-2 bg-[#F5F1E6] hover:bg-[#D4B254] text-[#2C5545] hover:text-white rounded-lg font-['Lato'] font-medium transition-all duration-200">
                        Modifier
                      </button>
                      <button className="px-4 py-2 bg-[#2C5545] hover:bg-[#1a3329] text-white rounded-lg font-['Lato'] font-medium transition-all duration-200">
                        Générer codes
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-xl font-bold text-[#2C5545]">{gain.quantity.toLocaleString()}</div>
                      <div className="text-xs text-gray-600 font-['Lato']">Total codes</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-xl font-bold text-[#D4B254]">{gain.remaining.toLocaleString()}</div>
                      <div className="text-xs text-gray-600 font-['Lato']">Restants</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-xl font-bold text-green-600">{(gain.quantity - gain.remaining).toLocaleString()}</div>
                      <div className="text-xs text-gray-600 font-['Lato']">Utilisés</div>
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-[#D4B254] h-3 rounded-full transition-all duration-500"
                      style={{ width: `${((gain.quantity - gain.remaining) / gain.quantity) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-right text-sm text-gray-500 mt-1 font-['Lato']">
                    {(((gain.quantity - gain.remaining) / gain.quantity) * 100).toFixed(1)}% utilisés
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Other tabs content would go here */}
        {activeTab !== 'dashboard' && activeTab !== 'gains' && (
          <div className="bg-white rounded-xl p-8 shadow-[0_2px_8px_rgba(0,0,0,0.08)] text-center">
            <div className="text-4xl mb-4">🚧</div>
            <h3 className="font-['Playfair_Display'] text-xl font-bold text-[#2C5545] mb-2">
              Section en construction
            </h3>
            <p className="text-gray-600 font-['Lato']">
              Cette section sera bientôt disponible.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
