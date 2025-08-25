'use client';

import { useState, useEffect } from 'react';
import Navigation from '../../components/Navigation';

interface User {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface UnclaimedPrize {
  id: string;
  user: User;
  gain: {
    name: string;
    value: number;
  };
  code: {
    code: string;
  };
  participationDate: string;
}

interface ClaimedPrize {
  id: string;
  user: User;
  gain: {
    name: string;
    value: number;
  };
  code: {
    code: string;
  };
  participationDate: string;
  claimedAt: string;
}

interface EmployeeStats {
  todayClaimed: number;
  thisWeekClaimed: number;
  totalClaimed: number;
}

export default function EmployeePage() {
  const [activeTab, setActiveTab] = useState('unclaimed');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [employeeStats, setEmployeeStats] = useState<EmployeeStats | null>(null);
  const [unclaimedPrizes, setUnclaimedPrizes] = useState<UnclaimedPrize[]>([]);
  const [claimedPrizes, setClaimedPrizes] = useState<ClaimedPrize[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check employee authentication
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      window.location.href = '/auth';
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'EMPLOYEE' && parsedUser.role !== 'ADMIN') {
        alert('Accès refusé. Vous devez être employé ou administrateur.');
        window.location.href = '/';
        return;
      }
      setUser(parsedUser);
      loadEmployeeData(token);
    } catch (error) {
      console.error('Error parsing user data:', error);
      window.location.href = '/auth';
    }
  }, []);

  const loadEmployeeData = async (token: string) => {
    try {
      // Load employee stats
      const statsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employee/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (statsResponse.ok) {
        const stats = await statsResponse.json();
        setEmployeeStats(stats);
      }

      // Load unclaimed prizes
      const unclaimedResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employee/unclaimed-prizes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (unclaimedResponse.ok) {
        const unclaimed = await unclaimedResponse.json();
        setUnclaimedPrizes(unclaimed);
      }

      // Load claimed prizes history
      const claimedResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employee/claimed-prizes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (claimedResponse.ok) {
        const claimed = await claimedResponse.json();
        setClaimedPrizes(claimed);
      }
    } catch (error) {
      console.error('Error loading employee data:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleClaimPrize = async (prizeId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employee/claim-prize/${prizeId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert('Prix remis avec succès !');
        loadEmployeeData(token); // Reload data
      } else {
        const error = await response.json();
        alert(error.message || 'Erreur lors de la remise du prix');
      }
    } catch (error) {
      console.error('Error claiming prize:', error);
      alert('Erreur lors de la remise du prix');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const filteredUnclaimedPrizes = unclaimedPrizes.filter(prize => {
    const fullName = `${prize.user.firstName} ${prize.user.lastName}`;
    return fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           prize.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
           prize.code.code.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredClaimedPrizes = claimedPrizes.filter(prize => {
    const fullName = `${prize.user.firstName} ${prize.user.lastName}`;
    return fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           prize.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
           prize.code.code.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getPrizeIcon = (prizeName: string) => {
    if (prizeName.toLowerCase().includes('infuseur')) return '🫖';
    if (prizeName.toLowerCase().includes('coffret')) return '🎁';
    if (prizeName.toLowerCase().includes('signature')) return '⭐';
    if (prizeName.toLowerCase().includes('détox')) return '🍃';
    if (prizeName.toLowerCase().includes('premium')) return '🏆';
    return '🍵';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2C5545] mx-auto mb-4"></div>
          <p className="text-[#2C5545] font-['Lato']">Chargement des données employé...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

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
                  {employeeStats?.todayClaimed || 0}
                </div>
                <div className="font-['Lato'] text-sm text-gray-600">Prix remis aujourd&apos;hui</div>
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
                  {employeeStats?.thisWeekClaimed || 0}
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
                  {employeeStats?.totalClaimed || 0}
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
              className="w-full h-12 pl-10 pr-4 border-2 border-gray-200 rounded-lg font-['Lato'] focus:border-[#D4B254] focus:outline-none transition-colors text-black"
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
                        {getPrizeIcon(prize.gain.name)}
                      </div>

                      {/* Prize Info */}
                      <div>
                        <h3 className="font-['Lato'] font-bold text-lg text-[#2C5545] mb-1">
                          {prize.gain.name}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 font-['Lato']">
                          <span>Code: <span className="font-mono font-medium">{prize.code.code}</span></span>
                          <span>•</span>
                          <span>Participation: {formatDate(prize.participationDate)}</span>
                          <span>•</span>
                          <span className="font-bold text-[#D4B254]">{prize.gain.value}€</span>
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
                        <div className="font-['Lato'] font-medium text-[#2C5545]">{prize.user.firstName} {prize.user.lastName}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 font-['Lato'] uppercase tracking-wide mb-1">Email</div>
                        <div className="font-['Lato'] text-gray-700">{prize.user.email}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 font-['Lato'] uppercase tracking-wide mb-1">Téléphone</div>
                        <div className="font-['Lato'] text-gray-700">{prize.user.phone || 'Non renseigné'}</div>
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
                          <span className="text-xl">{getPrizeIcon(prize.gain.name)}</span>
                          <span className="font-['Lato'] font-medium text-[#2C5545]">{prize.gain.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-['Lato'] font-medium text-gray-900">{prize.user.firstName} {prize.user.lastName}</div>
                          <div className="text-sm text-gray-500">{prize.user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-900">
                        {prize.code.code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-['Lato'] text-sm text-gray-500">
                        {formatDate(prize.participationDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-['Lato'] text-sm text-gray-900">
                        <div>{formatDate(prize.claimedAt)}</div>
                        <div className="text-xs text-gray-500">{new Date(prize.claimedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-['Lato'] font-bold text-[#D4B254]">{prize.gain.value}€</span>
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
