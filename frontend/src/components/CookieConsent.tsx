'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const acceptAll = () => {
    const consentData = {
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('cookie-consent', JSON.stringify(consentData));
    setShowBanner(false);
  };

  const acceptNecessary = () => {
    const consentData = {
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('cookie-consent', JSON.stringify(consentData));
    setShowBanner(false);
  };

  const savePreferences = () => {
    const consentData = {
      ...preferences,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('cookie-consent', JSON.stringify(consentData));
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              🍪 Gestion des cookies
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Nous utilisons des cookies pour améliorer votre expérience sur notre site. 
              Vous pouvez accepter tous les cookies ou personnaliser vos préférences.{' '}
              <Link 
                href="/legal" 
                className="text-[#D4B254] hover:text-[#C4A244] underline font-medium"
              >
                En savoir plus
              </Link>
            </p>
            
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.necessary}
                  disabled
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">
                  <strong>Cookies nécessaires</strong> - Requis pour le fonctionnement du site
                </span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) => setPreferences(prev => ({ ...prev, analytics: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">
                  <strong>Cookies analytiques</strong> - Nous aident à améliorer le site
                </span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.marketing}
                  onChange={(e) => setPreferences(prev => ({ ...prev, marketing: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">
                  <strong>Cookies marketing</strong> - Pour personnaliser les publicités
                </span>
              </label>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 min-w-fit">
            <button
              onClick={acceptNecessary}
              className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Nécessaires uniquement
            </button>
            <button
              onClick={savePreferences}
              className="px-4 py-2 text-sm bg-[#D4B254] text-white rounded-md hover:bg-[#C4A244] transition-colors"
            >
              Sauvegarder préférences
            </button>
            <button
              onClick={acceptAll}
              className="px-4 py-2 text-sm bg-[#8B4513] text-white rounded-md hover:bg-[#7B3F13] transition-colors"
            >
              Accepter tout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
