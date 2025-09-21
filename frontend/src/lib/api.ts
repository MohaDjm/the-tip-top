// Configuration API centralisée
const getApiUrl = (): string => {
  // Vérifier d'abord si on est côté client
  if (typeof window !== 'undefined') {
    // Côté client - détecter l'environnement par l'URL
    if (window.location.hostname === '164.68.103.88' || 
        window.location.hostname === 'dsp5-archi-o23dis-g8.fr' ||
        window.location.hostname === 'www.dsp5-archi-o23dis-g8.fr') {
      return '/api'; // Utiliser le reverse proxy Nginx
    }
    return 'http://localhost:3002/api';
  }
  
  // Côté serveur - utiliser les variables d'environnement
  if (process.env.NODE_ENV === 'production') {
    return '/api'; // Utiliser le reverse proxy Nginx
  }
  
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';
};

export const API_URL = getApiUrl();

// Fonction helper pour les appels API
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    // Vérifier que la réponse est bien du JSON
    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      const textResponse = await response.text();
      throw new Error(`Réponse non-JSON: ${textResponse}`);
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      // Si le serveur retourne une erreur avec un message JSON, l'utiliser
      const errorMessage = data.error || data.message || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }
    
    return data;
  } catch (error) {
    console.error('API call failed:', error);
    // Ne pas essayer de faire .json() sur l'erreur
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Erreur API inconnue');
  }
};
