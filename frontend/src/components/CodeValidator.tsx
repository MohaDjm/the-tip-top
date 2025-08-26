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
      if (!token) {
        throw new Error('Vous devez être connecté pour valider un code');
      }
      
      console.log('DEBUG: Appel API vers:', `${API_URL}/participation/check-code`);
      console.log('DEBUG: Code envoyé:', code.trim());
      
      const response = await fetch(`${API_URL}/participation/check-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code: code.trim() })
      });

      console.log('DEBUG: Response reçue:', response);
      console.log('DEBUG: Response status:', response.status);
      console.log('DEBUG: Response headers:', Object.fromEntries(response.headers.entries()));

      // Vérification critique pour éviter l'erreur "e.json is not a function"
      if (!response) {
        throw new Error('Aucune réponse du serveur');
      }

      // Vérifier le type de contenu
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        const textResponse = await response.text();
        throw new Error(`Réponse serveur invalide: ${textResponse || 'Format non-JSON'}`);
      }

      // Parser le JSON de manière sécurisée
      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error('Impossible de parser la réponse du serveur');
      }

      if (!response.ok) {
        const errorMsg = data?.error || data?.message || `Erreur ${response.status}`;
        throw new Error(errorMsg);
      }

      // Vérifier la structure de la réponse
      if (!data || typeof data !== 'object') {
        throw new Error('Réponse serveur invalide');
      }

      // Extraire le nom du gain
      let prizeName = '';
      if (data.gain?.name) {
        prizeName = data.gain.name;
      } else if (data.prize) {
        prizeName = data.prize;
      } else {
        throw new Error('Aucun gain trouvé dans la réponse');
      }
      
      setTargetPrize(prizeName);
      setShowWheel(true);
      
    } catch (err: unknown) {
      let errorMessage = 'Erreur de validation du code';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      setError(errorMessage);
      console.error('Erreur validation code:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleWheelComplete = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Token manquant pour la réclamation');
        return;
      }
      
      const response = await fetch(`${API_URL}/participation/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code: code.trim() })
      });

      if (!response) {
        console.error('Aucune réponse lors de la réclamation');
        return;
      }

      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        const textResponse = await response.text();
        console.error('Réponse non-JSON lors de la réclamation:', textResponse);
        return;
      }

      let data;
      try {
        data = await response.json();
      } catch {
        console.error('Impossible de parser la réponse de réclamation');
        return;
      }

      if (!response.ok) {
        const errorMsg = data?.error || data?.message || `Erreur ${response.status}`;
        console.error('Erreur lors de la réclamation:', errorMsg);
        return;
      }

      console.log('Participation enregistrée avec succès:', data);
      
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
              onChange={(e) => setCode(e.target.value)}
              placeholder="Ex: 3668559563"
              maxLength={10}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-lg font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-[#D4B254] focus:border-transparent"
              disabled={loading}
            />
            <p className="text-sm text-gray-500 mt-1 text-center">
              Format: 10 chiffres
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