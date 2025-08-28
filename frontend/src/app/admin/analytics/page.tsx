'use client';

import { useState, useEffect } from 'react';
import Navigation from '../../../components/Navigation';

interface AnalyticsData {
  totalPageViews: number;
  totalRegistrations: number;
  totalParticipations: number;
  conversionRate: number;
  ctaClicks: number;
  newsletterSubscriptions: number;
  topPages: Array<{
    page: string;
    views: number;
  }>;
  conversionFunnel: Array<{
    step: string;
    count: number;
    percentage: number;
  }>;
  dailyStats: Array<{
    date: string;
    pageViews: number;
    registrations: number;
    participations: number;
  }>;
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d');

  useEffect(() => {
    loadAnalyticsData();
  }, [dateRange]);

  const loadAnalyticsData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Load main analytics stats
      const [statsResponse, topPagesResponse, ctaResponse] = await Promise.all([
        fetch('/api/admin/analytics/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/admin/analytics/top-pages', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/admin/analytics/cta-performance', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (statsResponse.ok && topPagesResponse.ok && ctaResponse.ok) {
        const [statsData, topPagesData, ctaData] = await Promise.all([
          statsResponse.json(),
          topPagesResponse.json(),
          ctaResponse.json()
        ]);

        // Mock conversion funnel data
        const conversionFunnel = [
          { step: 'Visiteurs', count: statsData.data.pageViews, percentage: 100 },
          { step: 'Clics CTA', count: statsData.data.ctaClicks, percentage: statsData.data.pageViews > 0 ? (statsData.data.ctaClicks / statsData.data.pageViews) * 100 : 0 },
          { step: 'Participations', count: statsData.data.totalParticipations, percentage: statsData.data.conversionRate }
        ];

        setAnalyticsData({
          totalPageViews: statsData.data.pageViews,
          totalRegistrations: statsData.data.totalParticipations, // Using participations as registrations
          totalParticipations: statsData.data.totalParticipations,
          conversionRate: statsData.data.conversionRate,
          ctaClicks: statsData.data.ctaClicks,
          newsletterSubscriptions: statsData.data.newsletterSubscriptions,
          topPages: topPagesData.data || [],
          conversionFunnel,
          dailyStats: [] // Placeholder for future implementation
        });
      }
    } catch (error) {
      console.error('Erreur chargement analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2C5545] mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement des analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-['Playfair_Display'] text-3xl font-bold text-[#2C5545]">
              📊 Analytics Dashboard
            </h1>
            <p className="text-gray-600 font-['Lato'] mt-2">
              Suivi des performances et conversions
            </p>
          </div>

          {/* Date Range Selector */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg font-['Lato'] focus:outline-none focus:ring-2 focus:ring-[#2C5545]"
          >
            <option value="1d">Dernières 24h</option>
            <option value="7d">7 derniers jours</option>
            <option value="30d">30 derniers jours</option>
            <option value="90d">90 derniers jours</option>
          </select>
        </div>

        {analyticsData && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 font-['Lato'] text-sm">Pages vues</p>
                    <p className="text-2xl font-bold text-[#2C5545] font-['Playfair_Display']">
                      {analyticsData.totalPageViews.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-3xl">👁️</div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 font-['Lato'] text-sm">Inscriptions</p>
                    <p className="text-2xl font-bold text-[#2C5545] font-['Playfair_Display']">
                      {analyticsData.totalRegistrations.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-3xl">👤</div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 font-['Lato'] text-sm">Participations</p>
                    <p className="text-2xl font-bold text-[#2C5545] font-['Playfair_Display']">
                      {analyticsData.totalParticipations.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-3xl">🎯</div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 font-['Lato'] text-sm">Taux conversion</p>
                    <p className="text-2xl font-bold text-[#2C5545] font-['Playfair_Display']">
                      {analyticsData.conversionRate.toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-3xl">📈</div>
                </div>
              </div>
            </div>

            {/* Conversion Funnel */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                <h3 className="font-['Playfair_Display'] text-xl font-bold text-[#2C5545] mb-6">
                  🔄 Entonnoir de conversion
                </h3>
                <div className="space-y-4">
                  {analyticsData.conversionFunnel.map((step, index) => (
                    <div key={index} className="relative">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-['Lato'] text-sm text-gray-600">{step.step}</span>
                        <span className="font-['Lato'] text-sm font-semibold text-[#2C5545]">
                          {step.count} ({step.percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-[#2C5545] to-[#D4B254] h-3 rounded-full transition-all duration-500"
                          style={{ width: `${step.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Pages */}
              <div className="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                <h3 className="font-['Playfair_Display'] text-xl font-bold text-[#2C5545] mb-6">
                  📄 Pages les plus visitées
                </h3>
                <div className="space-y-3">
                  {analyticsData.topPages.map((page, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                      <span className="font-['Lato'] text-gray-700">{page.page}</span>
                      <span className="font-['Lato'] font-semibold text-[#2C5545]">
                        {page.views.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 font-['Lato'] text-sm">Clics CTA</p>
                    <p className="text-2xl font-bold text-[#2C5545] font-['Playfair_Display']">
                      {analyticsData.ctaClicks.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-3xl">🎯</div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 font-['Lato'] text-sm">Newsletter</p>
                    <p className="text-2xl font-bold text-[#2C5545] font-['Playfair_Display']">
                      {analyticsData.newsletterSubscriptions.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-3xl">📧</div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 font-['Lato'] text-sm">Taux CTA</p>
                    <p className="text-2xl font-bold text-[#2C5545] font-['Playfair_Display']">
                      {analyticsData.totalPageViews > 0 
                        ? ((analyticsData.ctaClicks / analyticsData.totalPageViews) * 100).toFixed(1)
                        : 0}%
                    </p>
                  </div>
                  <div className="text-3xl">📊</div>
                </div>
              </div>
            </div>

            {/* Daily Trend Chart Placeholder */}
            <div className="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
              <h3 className="font-['Playfair_Display'] text-xl font-bold text-[#2C5545] mb-6">
                📈 Évolution quotidienne
              </h3>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-4xl mb-4">📊</div>
                  <p className="text-gray-500 font-['Lato']">
                    Graphique en cours d'implémentation
                  </p>
                  <p className="text-gray-400 font-['Lato'] text-sm mt-2">
                    Intégration Chart.js prévue
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
