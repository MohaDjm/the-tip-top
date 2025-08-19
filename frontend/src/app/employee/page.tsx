'use client';

import { useState } from 'react';

export default function EmployeePage() {
  const [activeTab, setActiveTab] = useState('unclaimed');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - replace with real data from API
  const employeeStats = {
    todayClaimed: 12,
    thisWeekClaimed: 45,
    totalClaimed: 287
  };

  const unclaimedPrizes = [
    {
      id: 1,
      user: { name: 'Marie Dubois', email: 'marie@email.com', phone: '06 12 34 56 78' },
      prize: 'Infuseur à thé',
      value: 8,
      code: 'ABC123XYZ0',
      date: '2024-01-20',
      icon: '🫖'
    },
    {
      id: 2,
      user: { name: 'Pierre Martin', email: 'pierre@email.com', phone: '06 23 45 67 89' },
      prize: 'Coffret découverte 39€',
      value: 39,
      code: 'DEF456UVW1',
      date: '2024-01-19',
      icon: '🎁'
    },
    {
      id: 3,
      user: { name: 'Sophie Laurent', email: 'sophie@email.com', phone: '06 34 56 78 90' },
      prize: 'Thé signature 100g',
      value: 18,
      code: 'GHI789RST2',
      date: '2024-01-18',
      icon: '⭐'
    },
    {
      id: 4,
      user: { name: 'Jean Moreau', email: 'jean@email.com', phone: '06 45 67 89 01' },
      prize: 'Coffret premium 69€',
      value: 69,
      code: 'JKL012MNO3',
      date: '2024-01-17',
      icon: '🏆'
    }
  ];

  const claimedPrizes = [
    {
      id: 5,
      user: { name: 'Claire Bernard', email: 'claire@email.com', phone: '06 56 78 90 12' },
      prize: 'Thé détox 100g',
      value: 12,
      code: 'PQR345STU4',
      participationDate: '2024-01-15',
      claimedDate: '2024-01-20',
      claimedTime: '14:30',
      icon: '🍃'
    },
    {
      id: 6,
      user: { name: 'Luc Petit', email: 'luc@email.com', phone: '06 67 89 01 23' },
      prize: 'Infuseur à thé',
      value: 8,
      code: 'VWX678YZA5',
      participationDate: '2024-01-14',
      claimedDate: '2024-01-19',
      claimedTime: '16:45',
      icon: '🫖'
    }
  ];

  const handleClaimPrize = (prizeId: number) => {
    // Handle prize claiming logic
    console.log('Claiming prize:', prizeId);
    // This would typically make an API call to mark the prize as claimed
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const filteredUnclaimedPrizes = unclaimedPrizes.filter(prize =>
    prize.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prize.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prize.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredClaimedPrizes = claimedPrizes.filter(prize =>
    prize.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prize.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prize.code.toLowerCase().includes(searchTerm.toLowerCase())
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
              <span className="font-['Lato'] text-lg text-gray-600">Interface Employé</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="font-['Lato'] font-medium text-[#2C5545]">Employé Boutique</div>
                <div className="text-sm text-gray-500">Nice Centre</div>
              </div>
              <div className="w-10 h-10 bg-[#D4B254] rounded-full flex items-center justify-center">
                <span className="text-white font-bold">E</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📅</span>
              </div>
              <div>
                <div className="font-['Playfair_Display'] text-2xl font-bold text-[#2C5545]">
                  {employeeStats.todayClaimed}
                </div>
                <div className="font-['Lato'] text-sm text-gray-600">Prix remis aujourd'hui</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <div className="font-['Playfair_Display'] text-2xl font-bold text-[#2C5545]">
                  {employeeStats.thisWeekClaimed}
                </div>
                <div className="font-['Lato'] text-sm text-gray-600">Prix remis cette semaine</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🏆</span>
              </div>
              <div>
                <div className="font-['Playfair_Display'] text-2xl font-bold text-[#D4B254]">
                  {employeeStats.totalClaimed}
                </div>
                <div className="font-['Lato'] text-sm text-gray-600">Total prix remis</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Rechercher par nom, email ou code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 pl-10 pr-4 border-2 border-gray-200 rounded-lg font-['Lato'] focus:border-[#D4B254] focus:outline-none transition-colors"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('unclaimed')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-md font-['Lato'] font-medium transition-all duration-200 ${
              activeTab === 'unclaimed'
                ? 'bg-white text-[#2C5545] shadow-sm'
                : 'text-gray-600 hover:text-[#2C5545]'
            }`}
          >
            <span>⏳</span>
            <span>Prix à remettre ({filteredUnclaimedPrizes.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('claimed')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-md font-['Lato'] font-medium transition-all duration-200 ${
              activeTab === 'claimed'
                ? 'bg-white text-[#2C5545] shadow-sm'
                : 'text-gray-600 hover:text-[#2C5545]'
            }`}
          >
            <span>✅</span>
            <span>Prix remis ({filteredClaimedPrizes.length})</span>
          </button>
        </div>

        {/* Unclaimed Prizes */}
        {activeTab === 'unclaimed' && (
          <div className="space-y-4">
            {filteredUnclaimedPrizes.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                <div className="text-4xl mb-4">🎉</div>
                <h3 className="font-['Playfair_Display'] text-xl font-bold text-[#2C5545] mb-2">
                  Aucun prix en attente
                </h3>
                <p className="text-gray-600 font-['Lato']">
                  Tous les prix ont été remis aux gagnants !
                </p>
              </div>
            ) : (
              filteredUnclaimedPrizes.map((prize) => (
                <div key={prize.id} className="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      {/* Prize Icon */}
                      <div className="w-16 h-16 bg-[#F5F1E6] rounded-xl flex items-center justify-center text-2xl">
                        {prize.icon}
                      </div>

                      {/* Prize Info */}
                      <div>
                        <h3 className="font-['Lato'] font-bold text-lg text-[#2C5545] mb-1">
                          {prize.prize}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 font-['Lato']">
                          <span>Code: <span className="font-mono font-medium">{prize.code}</span></span>
                          <span>•</span>
                          <span>Participation: {formatDate(prize.date)}</span>
                          <span>•</span>
                          <span className="font-bold text-[#D4B254]">{prize.value}€</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => handleClaimPrize(prize.id)}
                      className="bg-[#2C5545] hover:bg-[#1a3329] text-white px-6 py-3 rounded-lg font-['Lato'] font-bold transition-all duration-200 shadow-[0_4px_12px_rgba(44,85,69,0.15)] hover:shadow-[0_6px_20px_rgba(44,85,69,0.25)] transform hover:-translate-y-0.5"
                    >
                      REMETTRE LE PRIX
                    </button>
                  </div>

                  {/* Customer Info */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div className="text-xs text-gray-500 font-['Lato'] uppercase tracking-wide mb-1">Client</div>
                        <div className="font-['Lato'] font-medium text-[#2C5545]">{prize.user.name}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 font-['Lato'] uppercase tracking-wide mb-1">Email</div>
                        <div className="font-['Lato'] text-gray-700">{prize.user.email}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 font-['Lato'] uppercase tracking-wide mb-1">Téléphone</div>
                        <div className="font-['Lato'] text-gray-700">{prize.user.phone}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Claimed Prizes */}
        {activeTab === 'claimed' && (
          <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <div className="p-6 border-b border-gray-200">
              <h3 className="font-['Playfair_Display'] text-xl font-bold text-[#2C5545]">
                Historique des prix remis
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-['Lato'] font-medium text-gray-500 uppercase tracking-wider">
                      Prix
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-['Lato'] font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-['Lato'] font-medium text-gray-500 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-['Lato'] font-medium text-gray-500 uppercase tracking-wider">
                      Participation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-['Lato'] font-medium text-gray-500 uppercase tracking-wider">
                      Remis le
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-['Lato'] font-medium text-gray-500 uppercase tracking-wider">
                      Valeur
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredClaimedPrizes.map((prize) => (
                    <tr key={prize.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">{prize.icon}</span>
                          <span className="font-['Lato'] font-medium text-[#2C5545]">{prize.prize}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-['Lato'] font-medium text-gray-900">{prize.user.name}</div>
                          <div className="text-sm text-gray-500">{prize.user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-900">
                        {prize.code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-['Lato'] text-sm text-gray-500">
                        {formatDate(prize.participationDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-['Lato'] text-sm text-gray-900">
                        <div>{formatDate(prize.claimedDate)}</div>
                        <div className="text-xs text-gray-500">{prize.claimedTime}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-['Lato'] font-bold text-[#D4B254]">{prize.value}€</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
