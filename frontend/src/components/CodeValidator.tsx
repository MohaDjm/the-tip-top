'use client';

import React, { useState } from 'react';
import PrizeWheel from './PrizeWheel';
import { API_URL } from '@/lib/api';

interface CodeValidatorProps {
  onClose?: () => void;
}

export default function CodeValidator({ onClose }: CodeValidatorProps) {
  const [targetPrize, setTargetPrize] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showWheel, setShowWheel] = useState(false);
  const [code, setCode] = useState('');

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) {
      setError('Veuillez saisir un code');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      
      // 1. Vérifier le code et récupérer le gain (sans marquer comme utilisé)
      const response = await fetch(`${API_URL}/participation/validate-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code: code.toUpperCase().trim() })
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        // Gestion des réponses non-JSON (très rare mais possible)
        throw new Error('Erreur serveur : réponse invalide');
      }

      if (!response.ok) {
        throw new Error(data?.error || data?.message || 'Erreur lors de la vérification du code');
      }

      // 2. Définir le gain cible et afficher la roue
      setTargetPrize(data.gain?.name || data.prize);
      setShowWheel(true);
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Erreur de validation du code';
      
      setError(errorMessage);
      console.error('Erreur complète:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleWheelComplete = async (prize: string) => {
    try {
      const token = localStorage.getItem('token');
      
      // 3. Marquer le code comme utilisé après l'animation
      const response = await fetch(`${API_URL}/participation/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code: code.toUpperCase().trim() })
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Réponse invalide lors de la réclamation');
        return;
      }

      if (!response.ok) {
        console.error('Erreur lors de la réclamation:', data?.error || 'Erreur inconnue');
      }

      console.log('Participation enregistrée:', data);
      
    } catch (err) {
      console.error('Erreur lors de la réclamation du gain:', err);
    }
  };

  const handleClose = () => {
    setShowWheel(false);
    setCode('');
    setTargetPrize('');
    setError('');
    onClose?.();
  };

  if (showWheel && targetPrize) {
    return (
      <PrizeWheel 
        targetPrize={targetPrize} 
        onComplete={handleWheelComplete}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <h2 className="font-['Playfair_Display'] text-2xl font-bold text-[#2C5545] mb-2">
            Saisissez votre code
          </h2>
          <p className="text-[#2C5545] font-['Lato']">
            Entrez le code de 10 caractères trouvé sur votre ticket
          </p>
        </div>

        <form onSubmit={handleCodeSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Ex: ABCD123456"
              maxLength={10}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-lg font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-[#D4B254] focus:border-transparent"
              disabled={loading}
            />
            <p className="text-sm text-gray-500 mt-1 text-center">
              Format: 10 caractères (lettres et chiffres)
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-['Lato'] font-medium hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || code.length !== 10}
              className="flex-1 px-4 py-3 bg-[#D4B254] hover:bg-[#c19d47] disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-['Lato'] font-bold transition-colors"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Vérification...
                </div>
              ) : (
                'Vérifier'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}