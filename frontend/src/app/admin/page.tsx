'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Navigation from '@/components/Navigation';
import { apiCall } from '@/lib/api';
import GrandTirage from '@/components/GrandTirage';

interface AdminStats {
  totalUsers: number;
  totalParticipations: number;
  totalCodes: number;
  usedCodes: number;
  claimedPrizes: number;
  totalValue: number;
}

interface RecentParticipation {
  id: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  gain: {
    name: string;
    value: number;
  };
  participationDate: string;
  isClaimed: boolean;
}

interface Gain {
  id: string;
  name: string;
  value: number;
  description: string;
  totalCodes: number;
  usedCodes: number;
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<AdminStats | null>(null);
  const [recentParticipations, setRecentParticipations] = useState<RecentParticipation[]>([]);
  const [gains, setGains] = useState<Gain[]>([]);
  const [user, setUser] = useState<any>(null);
  const [employeeStats, setEmployeeStats] = useState<any>(null);
  const [unclaimedPrizes, setUnclaimedPrizes] = useState<any[]>([]);
  const [claimedPrizes, setClaimedPrizes] = useState<any[]>([]);
  const [participations, setParticipations] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [participationFilters, setParticipationFilters] = useState({ status: '', gainId: '' });
  const [userFilters, setUserFilters] = useState({ role: '' });
  const [codes, setCodes] = useState<any[]>([]);
  const [codeStats, setCodeStats] = useState<any>(null);

  useEffect(() => {
    // Check admin authentication
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      window.location.href = '/auth';
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'ADMIN') {
        alert('Accès refusé. Vous devez être administrateur.');
        window.location.href = '/';
        return;
      }
      setUser(parsedUser);
      loadAdminData(token);
    } catch (error) {
      console.error('Error parsing user data:', error);
      window.location.href = '/auth';
    }
  }, []);

  const loadAdminData = async (token: string) => {
    try {
      // Load dashboard stats
      const response = await apiCall('/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const stats = await response.json();
        // Transform backend response to match frontend expectations
        const transformedStats = {
          totalUsers: stats.global?.totalUsers || 0,
          totalParticipations: stats.global?.totalParticipations || 0,
          totalCodes: stats.global?.totalCodes || 0,
          usedCodes: stats.global?.usedCodes || 0,
          claimedPrizes: stats.global?.claimedGains || 0,
          totalValue: stats.global?.totalValue || 0
        };
        setDashboardStats(transformedStats);
        console.log('Dashboard stats loaded:', stats);
        console.log('Transformed stats:', transformedStats);
      }

      // Load recent participations
      const recentParticipationsResponse = await apiCall('/admin/recent-participations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (recentParticipationsResponse.ok) {
        const participations = await recentParticipationsResponse.json();
        setRecentParticipations(participations);
      }

      // Load gains
      const gainsResponse = await apiCall('/admin/gains', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (gainsResponse.ok) {
        const gainsData = await gainsResponse.json();
        setGains(gainsData);
      }

      // Load employee data for admin access
      const employeeStatsResponse = await apiCall('/employee/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (employeeStatsResponse.ok) {
        const empStats = await employeeStatsResponse.json();
        setEmployeeStats(empStats);
      }

      const unclaimedResponse = await apiCall('/employee/unclaimed-prizes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (unclaimedResponse.ok) {
        const unclaimed = await unclaimedResponse.json();
        setUnclaimedPrizes(unclaimed);
      }

      const claimedResponse = await apiCall('/employee/claimed-prizes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (claimedResponse.ok) {
        const claimed = await claimedResponse.json();
        setClaimedPrizes(claimed);
      }

      // Load participations
      const participationsResponse = await apiCall('/admin/participations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (participationsResponse.ok) {
        const participationsData = await participationsResponse.json();
        setParticipations(participationsData || []);
      }

      // Load users
      const usersResponse = await apiCall('/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData || []);
      }

    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update code stats when dashboard stats change
  useEffect(() => {
    if (dashboardStats) {
      setCodeStats({
        total: dashboardStats.totalCodes,
        used: dashboardStats.usedCodes,
        available: dashboardStats.totalCodes - dashboardStats.usedCodes,
        usageRate: ((dashboardStats.usedCodes / dashboardStats.totalCodes) * 100).toFixed(1)
      });
    }
  }, [dashboardStats]);


  const getStatusBadge = (isClaimed: boolean) => {
    if (isClaimed) {
      return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Récupéré</span>;
    }
    return <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">En attente</span>;
  };

  const getPrizeIcon = (prizeName: string) => {
    if (prizeName.toLowerCase().includes('infuseur')) return '🫖';
    if (prizeName.toLowerCase().includes('coffret')) return '🎁';
    if (prizeName.toLowerCase().includes('signature')) return '⭐';
    if (prizeName.toLowerCase().includes('détox')) return '🍃';
    if (prizeName.toLowerCase().includes('premium')) return '🏆';
    return '🍵';
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
        loadAdminData(token); // Reload data
      } else {
        const error = await response.json();
        alert(error.message || 'Erreur lors de la remise du prix');
      }
    } catch (error) {
      console.error('Error claiming prize:', error);
      alert('Erreur lors de la remise du prix');
    }
  };

  const StatCard = ({ title, value, subtitle, color = 'bg-white' }: {
    title: string;
    value: string | number;
    subtitle?: string;
    color?: string;
  }) => (
    <div className={`${color} rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]`}>
      <h3 className="font-['Lato'] text-sm font-medium text-gray-600 mb-2">{title}</h3>
      <div className="font-['Playfair_Display'] text-3xl font-bold text-[#2C5545] mb-1">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      {subtitle && <p className="text-sm text-gray-500 font-['Lato']">{subtitle}</p>}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2C5545] mx-auto mb-4"></div>
          <p className="text-[#2C5545] font-['Lato']">Chargement des données administrateur...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-100 rounded-lg p-1">
          {[
            { id: 'dashboard', label: 'Tableau de bord', icon: '📊' },
            { id: 'participations', label: 'Participations', icon: '🎯' },
            { id: 'users', label: 'Utilisateurs', icon: '👥' },
            { id: 'gains', label: 'Gestion des gains', icon: '🎁' },
            { id: 'employee', label: 'Interface Employé', icon: '🏪' },
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
                value={dashboardStats?.totalUsers || 0}
                subtitle="+12% ce mois"
                color="bg-gradient-to-br from-blue-50 to-blue-100"
              />
              <StatCard
                title="Participations totales"
                value={dashboardStats?.totalParticipations || 0}
                subtitle={`Taux: ${dashboardStats ? ((dashboardStats.totalParticipations / dashboardStats.totalUsers) * 100).toFixed(1) : 0}%`}
                color="bg-gradient-to-br from-green-50 to-green-100"
              />
              <StatCard
                title="Codes utilisés"
                value={`${dashboardStats?.usedCodes || 0}/${dashboardStats?.totalCodes || 0}`}
                subtitle={`${dashboardStats ? ((dashboardStats.usedCodes / dashboardStats.totalCodes) * 100).toFixed(1) : 0}% utilisés`}
                color="bg-gradient-to-br from-purple-50 to-purple-100"
              />
              <StatCard
                title="Valeur totale distribuée"
                value={`${dashboardStats ? (dashboardStats.totalValue / 1000).toFixed(0) : 0}k€`}
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
                  {gains.map((gain, index) => {
                    const percentage = dashboardStats?.totalCodes ? ((gain.totalCodes / dashboardStats.totalCodes) * 100) : 0;
                    return (
                      <div key={gain.id} className="flex items-center space-x-4">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: `hsl(${index * 60}, 70%, 50%)` }}></div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-['Lato'] font-medium text-sm">{gain.name}</span>
                            <span className="text-sm text-gray-500">{percentage.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full transition-all duration-500"
                              style={{
                                width: `${percentage}%`,
                                backgroundColor: `hsl(${index * 60}, 70%, 50%)`
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
                            <div className="font-['Lato'] font-medium text-[#2C5545]">
                              {participation.user.firstName} {participation.user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{participation.user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-['Lato'] text-sm text-gray-900">
                          {participation.gain.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-['Lato'] text-sm text-gray-500">
                          {new Date(participation.participationDate).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(participation.isClaimed)}
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
              {gains.map((gain) => {
                const remainingCodes = gain.totalCodes - gain.usedCodes;
                const usagePercentage = gain.totalCodes > 0 ? (gain.usedCodes / gain.totalCodes) * 100 : 0;
                return (
                  <div key={gain.id} className="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-['Lato'] font-bold text-lg text-[#2C5545]">{gain.name}</h3>
                        <p className="text-sm text-gray-600">Valeur: {gain.value}€</p>
                        <p className="text-xs text-gray-500 mt-1">{gain.description}</p>
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
                        <div className="text-xl font-bold text-[#2C5545]">{gain.totalCodes.toLocaleString()}</div>
                        <div className="text-xs text-gray-600 font-['Lato']">Total codes</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-xl font-bold text-[#D4B254]">{remainingCodes.toLocaleString()}</div>
                        <div className="text-xs text-gray-600 font-['Lato']">Restants</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-xl font-bold text-green-600">{gain.usedCodes.toLocaleString()}</div>
                        <div className="text-xs text-gray-600 font-['Lato']">Utilisés</div>
                      </div>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-[#D4B254] h-3 rounded-full transition-all duration-500"
                        style={{ width: `${usagePercentage}%` }}
                      ></div>
                    </div>
                    <div className="text-right text-sm text-gray-500 mt-1 font-['Lato']">
                      {usagePercentage.toFixed(1)}% utilisés
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Employee Interface Tab */}
        {activeTab === 'employee' && (
          <div className="space-y-8">
            {/* Employee Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

            {/* Prize Management */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Unclaimed Prizes */}
              <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="font-['Playfair_Display'] text-xl font-bold text-[#2C5545]">
                    Prix à remettre ({unclaimedPrizes.length})
                  </h3>
                </div>
                <div className="p-6 max-h-96 overflow-y-auto">
                  {unclaimedPrizes.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">🎉</div>
                      <p className="text-gray-600 font-['Lato']">Tous les prix ont été remis !</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {unclaimedPrizes.slice(0, 5).map((prize) => (
                        <div key={prize.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <span className="text-xl">{getPrizeIcon(prize.gain.name)}</span>
                            <div>
                              <div className="font-['Lato'] font-medium text-[#2C5545]">{prize.gain.name}</div>
                              <div className="text-sm text-gray-500">{prize.user.firstName} {prize.user.lastName}</div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleClaimPrize(prize.id)}
                            className="bg-[#2C5545] hover:bg-[#1a3329] text-white px-3 py-1 rounded text-sm font-['Lato'] transition-colors"
                          >
                            Remettre
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Claims */}
              <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="font-['Playfair_Display'] text-xl font-bold text-[#2C5545]">
                    Prix récemment remis
                  </h3>
                </div>
                <div className="p-6 max-h-96 overflow-y-auto">
                  {claimedPrizes.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">📋</div>
                      <p className="text-gray-600 font-['Lato']">Aucun prix remis récemment</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {claimedPrizes.slice(0, 5).map((prize) => (
                        <div key={prize.id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <span className="text-xl">{getPrizeIcon(prize.gain.name)}</span>
                            <div>
                              <div className="font-['Lato'] font-medium text-[#2C5545]">{prize.gain.name}</div>
                              <div className="text-sm text-gray-500">{prize.user.firstName} {prize.user.lastName}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-['Lato'] text-gray-900">
                              {new Date(prize.claimedAt).toLocaleDateString('fr-FR')}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(prize.claimedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Participations Tab */}
        {activeTab === 'participations' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#2C5545]">
                  Gestion des Participations
                </h2>
                <div className="flex space-x-4">
                  <select 
                    value={participationFilters.status}
                    onChange={(e) => setParticipationFilters({...participationFilters, status: e.target.value})}
                    className="border border-gray-300 rounded-lg px-3 py-2 font-['Lato']"
                  >
                    <option value="">Tous les statuts</option>
                    <option value="claimed">Réclamés</option>
                    <option value="unclaimed">Non réclamés</option>
                  </select>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-['Lato'] font-semibold text-gray-700">Utilisateur</th>
                      <th className="text-left py-3 px-4 font-['Lato'] font-semibold text-gray-700">Gain</th>
                      <th className="text-left py-3 px-4 font-['Lato'] font-semibold text-gray-700">Code</th>
                      <th className="text-left py-3 px-4 font-['Lato'] font-semibold text-gray-700">Date</th>
                      <th className="text-left py-3 px-4 font-['Lato'] font-semibold text-gray-700">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participations.filter(p => 
                      !participationFilters.status || 
                      (participationFilters.status === 'claimed' && p.isClaimed) ||
                      (participationFilters.status === 'unclaimed' && !p.isClaimed)
                    ).slice(0, 20).map((participation) => (
                      <tr key={participation.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-['Lato']">
                          <div>
                            <div className="font-medium text-[#2C5545]">{participation.user.firstName} {participation.user.lastName}</div>
                            <div className="text-sm text-gray-500">{participation.user.email}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-['Lato']">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{getPrizeIcon(participation.gain.name)}</span>
                            <div>
                              <div className="font-medium">{participation.gain.name}</div>
                              <div className="text-sm text-gray-500">{participation.gain.value}€</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-['Lato'] font-mono text-sm">{participation.code.code}</td>
                        <td className="py-3 px-4 font-['Lato'] text-sm">
                          {new Date(participation.participationDate).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(participation.isClaimed)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {participations.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📋</div>
                  <p className="text-gray-600 font-['Lato']">Aucune participation trouvée</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#2C5545]">
                  Gestion des Utilisateurs
                </h2>
                <div className="flex space-x-4">
                  <select 
                    value={userFilters.role}
                    onChange={(e) => setUserFilters({...userFilters, role: e.target.value})}
                    className="border border-gray-300 rounded-lg px-3 py-2 font-['Lato']"
                  >
                    <option value="">Tous les rôles</option>
                    <option value="CLIENT">Clients</option>
                    <option value="EMPLOYEE">Employés</option>
                    <option value="ADMIN">Administrateurs</option>
                  </select>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-['Lato'] font-semibold text-gray-700">Utilisateur</th>
                      <th className="text-left py-3 px-4 font-['Lato'] font-semibold text-gray-700">Rôle</th>
                      <th className="text-left py-3 px-4 font-['Lato'] font-semibold text-gray-700">Email vérifié</th>
                      <th className="text-left py-3 px-4 font-['Lato'] font-semibold text-gray-700">Participations</th>
                      <th className="text-left py-3 px-4 font-['Lato'] font-semibold text-gray-700">Inscription</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.filter(u => 
                      !userFilters.role || u.role === userFilters.role
                    ).slice(0, 20).map((user) => (
                      <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-['Lato']">
                          <div>
                            <div className="font-medium text-[#2C5545]">{user.firstName} {user.lastName}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                            user.role === 'EMPLOYEE' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {user.role === 'ADMIN' ? 'Admin' : user.role === 'EMPLOYEE' ? 'Employé' : 'Client'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {user.emailVerified ? (
                            <span className="text-green-600">✓ Vérifié</span>
                          ) : (
                            <span className="text-orange-600">⚠ Non vérifié</span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-['Lato'] text-center">
                          <span className="bg-[#D4B254] text-white px-2 py-1 rounded-full text-sm">
                            {user._count.participations}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-['Lato'] text-sm">
                          {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {users.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">👥</div>
                  <p className="text-gray-600 font-['Lato']">Aucun utilisateur trouvé</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Codes Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Grand Tirage au Sort */}
            <GrandTirage />
            
            {/* Statistiques principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 mr-4">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 font-['Lato']">Utilisateurs</p>
                    <p className="text-2xl font-bold text-gray-900 font-['Lato']">{dashboardStats?.totalUsers || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-2xl">✅</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 font-['Lato']">Participations</p>
                    <p className="text-2xl font-bold text-gray-900 font-['Lato']">{dashboardStats?.totalParticipations || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-2xl">📦</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 font-['Lato']">Codes totaux</p>
                    <p className="text-2xl font-bold text-gray-900 font-['Lato']">{dashboardStats?.totalCodes || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-2xl">📊</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 font-['Lato']">Codes utilisés</p>
                    <p className="text-2xl font-bold text-gray-900 font-['Lato']">{dashboardStats?.usedCodes || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Code Distribution by Gain */}
            <div className="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
              <h3 className="font-['Playfair_Display'] text-xl font-bold text-[#2C5545] mb-6">
                Distribution des codes par gain
              </h3>
              
              <div className="space-y-4">
                {gains.map((gain: any) => {
                  const totalCodes = codeStats?.total || 1;
                  const percentage = ((gain.quantity / totalCodes) * 100).toFixed(1);
                  const remaining = gain.remainingQuantity || 0;
                  const used = gain.quantity - remaining;
                  
                  return (
                    <div key={gain.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">{getPrizeIcon(gain.name)}</span>
                          <div>
                            <div className="font-['Lato'] font-medium text-[#2C5545]">{gain.name}</div>
                            <div className="text-sm text-gray-500">{gain.value}€</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-['Lato'] font-medium">{gain.quantity.toLocaleString()} codes</div>
                          <div className="text-sm text-gray-500">{percentage}% du total</div>
                        </div>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                        <div 
                          className="bg-[#D4B254] h-3 rounded-full transition-all duration-300"
                          style={{ width: `${(used / gain.quantity) * 100}%` }}
                        ></div>
                      </div>
                      
                      <div className="flex justify-between text-sm font-['Lato']">
                        <span className="text-green-600">Utilisés: {used.toLocaleString()}</span>
                        <span className="text-blue-600">Restants: {remaining.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {gains.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🎁</div>
                  <p className="text-gray-600 font-['Lato']">Aucun gain configuré</p>
                </div>
              )}
            </div>

            {/* Code Management Actions */}
            <div className="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
              <h3 className="font-['Playfair_Display'] text-xl font-bold text-[#2C5545] mb-6">
                Actions de gestion
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="text-2xl">📈</span>
                    <div>
                      <div className="font-['Lato'] font-medium text-[#2C5545]">Statistiques détaillées</div>
                      <div className="text-sm text-gray-500">Voir l'utilisation par période</div>
                    </div>
                  </div>
                  <button className="w-full bg-[#2C5545] hover:bg-[#1a3329] text-white px-4 py-2 rounded font-['Lato'] transition-colors">
                    Voir les statistiques
                  </button>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="text-2xl">📊</span>
                    <div>
                      <div className="font-['Lato'] font-medium text-[#2C5545]">Export des données</div>
                      <div className="text-sm text-gray-500">Télécharger un rapport CSV</div>
                    </div>
                  </div>
                  <button className="w-full bg-[#D4B254] hover:bg-[#c19d47] text-white px-4 py-2 rounded font-['Lato'] transition-colors">
                    Exporter CSV
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other tabs content would go here */}
        {activeTab !== 'overview' && activeTab !== 'gains' && activeTab !== 'employee' && activeTab !== 'participations' && activeTab !== 'users' && activeTab !== 'codes' && (
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
