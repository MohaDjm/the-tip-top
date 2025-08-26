'use client';

import { useState, useEffect } from 'react';
import { apiCall } from '@/lib/api';

interface Winner {
  id: string;
  name: string;
  email: string;
}

interface DrawResult {
  id: string;
  winner: Winner;
  totalParticipants: number;
  drawDate: string;
}

interface DrawStatus {
  hasDrawn: boolean;
  totalParticipants: number;
  draw: DrawResult | null;
}

export default function GrandTirage() {
  const [status, setStatus] = useState<DrawStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger le statut du tirage
  const loadStatus = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      setIsLoading(true);
      const data = await apiCall('/admin/grand-tirage/status', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsLoading(false);
    }
  };

  // Lancer le tirage au sort
  const conductDraw = async () => {
    if (!confirm('Êtes-vous sûr de vouloir lancer le grand tirage au sort ? Cette action est irréversible.')) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setIsDrawing(true);
      setError(null);

      const result = await apiCall('/admin/grand-tirage', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      // Recharger le statut pour afficher le résultat
      await loadStatus();
      
      // Animation de célébration
      setTimeout(() => {
        alert(`🎉 Félicitations ! Le gagnant est : ${result.draw.winner.name}`);
      }, 500);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsDrawing(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadStatus();
    }
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          🎰 Grand Tirage au Sort Final
        </h2>
        <button
          onClick={loadStatus}
          className="text-sm text-gray-500 hover:text-gray-700"
          disabled={isLoading}
        >
          🔄 Actualiser
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="flex">
            <div className="text-red-400">⚠️</div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-blue-500 text-2xl mr-3">👥</div>
              <div>
                <p className="text-sm font-medium text-blue-600">Participants éligibles</p>
                <p className="text-2xl font-bold text-blue-900">
                  {status?.totalParticipants || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-green-500 text-2xl mr-3">⚖️</div>
              <div>
                <p className="text-sm font-medium text-green-600">Équité</p>
                <p className="text-sm font-bold text-green-900">
                  1 chance par personne
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Règles du tirage */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">📋 Règles du Grand Tirage</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Chaque participant ayant validé au moins un code a une chance</li>
            <li>• Une seule chance par personne (équité totale)</li>
            <li>• Le tirage ne peut être effectué qu'une seule fois</li>
            <li>• Supervision légale : Maître Arnaud Rick</li>
          </ul>
        </div>

        {/* Résultat du tirage ou bouton pour lancer */}
        {status?.hasDrawn && status.draw ? (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
            <div className="text-center">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Grand Tirage Effectué !
              </h3>
              <div className="bg-white rounded-lg p-4 mb-4">
                <p className="text-lg font-semibold text-gray-900">
                  🎉 Gagnant : {status.draw.winner.name}
                </p>
                <p className="text-sm text-gray-600">
                  Email : {status.draw.winner.email}
                </p>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Date du tirage : {new Date(status.draw.drawDate).toLocaleString('fr-FR')}</p>
                <p>Participants total : {status.draw.totalParticipants}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="mb-6">
              <div className="text-6xl mb-4">🎲</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Prêt pour le Grand Tirage ?
              </h3>
              <p className="text-gray-600 mb-6">
                Le tirage sélectionnera aléatoirement un gagnant parmi tous les participants.
                <br />
                <strong>Cette action est irréversible.</strong>
              </p>
            </div>

            <button
              onClick={conductDraw}
              disabled={isDrawing || (status?.totalParticipants || 0) === 0}
              className={`
                px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200
                ${isDrawing 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : (status?.totalParticipants || 0) === 0
                    ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                    : 'bg-gradient-to-r from-[#D4B254] to-[#8B4513] text-white hover:from-[#C4A244] hover:to-[#7B3F13] shadow-lg hover:shadow-xl transform hover:scale-105'
                }
              `}
            >
              {isDrawing ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Tirage en cours...
                </span>
              ) : (status?.totalParticipants || 0) === 0 ? (
                'Aucun participant'
              ) : (
                `🎰 Lancer le Grand Tirage (${status?.totalParticipants} participants)`
              )}
            </button>

            {(status?.totalParticipants || 0) === 0 && (
              <p className="text-sm text-gray-500 mt-2">
                Aucun participant éligible pour le moment
              </p>
            )}
          </div>
        )}
      </div>

      {/* Mentions légales */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Tirage au sort supervisé par Maître Arnaud Rick, Huissier de Justice
        </p>
      </div>
    </div>
  );
}
