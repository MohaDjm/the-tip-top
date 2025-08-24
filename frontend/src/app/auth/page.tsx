'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navigation from '../../components/Navigation';

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    confirmPassword: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (activeTab === 'signin') {
        // Login logic
        const response = await fetch('http://localhost:3002/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // Store token and redirect
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          
          // Redirect based on user role
          if (data.user.role === 'ADMIN') {
            window.location.href = '/admin';
          } else if (data.user.role === 'EMPLOYEE') {
            window.location.href = '/employee';
          } else {
            window.location.href = '/dashboard';
          }
        } else {
          alert(data.message || 'Erreur de connexion');
        }
      } else {
        // Registration logic
        if (formData.password !== formData.confirmPassword) {
          alert('Les mots de passe ne correspondent pas');
          return;
        }

        const response = await fetch('http://localhost:3002/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: '',
            address: '',
            city: '',
            postalCode: '',
            dateOfBirth: '1990-01-01'
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // Store token and redirect after successful registration
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          
          alert('Compte créé avec succès ! Bienvenue !');
          
          // Redirect based on user role
          if (data.user.role === 'ADMIN') {
            window.location.href = '/admin';
          } else if (data.user.role === 'EMPLOYEE') {
            window.location.href = '/employee';
          } else {
            window.location.href = '/dashboard';
          }
        } else {
          alert(data.message || 'Erreur lors de la création du compte');
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      alert('Erreur de connexion au serveur');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="flex min-h-screen">
        {/* Left Side - Green Section */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#2C5545] to-[#1a3329]">
        
        {/* Centered Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white">
          {/* Large Tea Icon */}
          <div className="mb-8">
            <div className="text-8xl">
              🫖
            </div>
          </div>
          
          <h1 className="font-['Playfair_Display'] text-4xl font-bold mb-4">
            Bienvenue chez<br />Thé Tip Top
          </h1>
          <p className="text-lg font-['Lato'] leading-relaxed opacity-90 max-w-sm px-12">
            Découvrez l&apos;univers premium du thé et participez à notre jeu-concours exceptionnel
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Logo for mobile */}
          <div className="lg:hidden mb-8 text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <span className="text-2xl">🍃</span>
              <h1 className="text-[#2C5545] text-2xl font-bold">Thé Tip Top</h1>
            </div>
          </div>

          {/* Page Title */}
          <div className="text-center mb-8">
            <h2 className="font-['Playfair_Display'] text-3xl font-bold text-[#2C5545] mb-2">
              Connexion
            </h2>
            <p className="text-gray-600 font-['Lato'] text-sm">
              Accédez à votre espace personnel
            </p>
          </div>

          {/* Tabs */}
          <div className="flex mb-8 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('signin')}
              className={`flex-1 py-3 text-center font-['Lato'] font-semibold transition-colors relative ${
                activeTab === 'signin'
                  ? 'text-[#2C5545] border-b-2 border-[#D4B254]'
                  : 'text-gray-500 hover:text-[#2C5545]'
              }`}
            >
              Se connecter
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className={`flex-1 py-3 text-center font-['Lato'] font-semibold transition-colors relative ${
                activeTab === 'signup'
                  ? 'text-[#2C5545] border-b-2 border-[#D4B254]'
                  : 'text-gray-500 hover:text-[#2C5545]'
              }`}
            >
              S&apos;inscrire
            </button>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3 mb-6">
            <button className="w-full h-12 border-2 border-gray-200 rounded-lg font-['Lato'] font-medium text-gray-700 hover:border-[#D4B254] hover:bg-[#F5F1E6] transition-all duration-200 flex items-center justify-center space-x-3">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Continuer avec Google</span>
            </button>
            
            <button className="w-full h-12 border-2 border-gray-200 rounded-lg font-['Lato'] font-medium text-gray-700 hover:border-[#D4B254] hover:bg-[#F5F1E6] transition-all duration-200 flex items-center justify-center space-x-3">
              <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>Continuer avec Facebook</span>
            </button>
          </div>

          {/* Separator */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#D4B254]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-['Lato']">ou</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {activeTab === 'signup' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-['Lato'] font-medium text-[#2C5545] mb-2">
                      Prénom
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full h-12 px-4 border-2 border-gray-200 rounded-lg font-['Lato'] focus:border-[#D4B254] focus:outline-none transition-colors text-black"
                      placeholder="Votre prénom"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-['Lato'] font-medium text-[#2C5545] mb-2">
                      Nom
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full h-12 px-4 border-2 border-gray-200 rounded-lg font-['Lato'] focus:border-[#D4B254] focus:outline-none transition-colors text-black"
                      placeholder="Votre nom"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-['Lato'] font-medium text-[#2C5545] mb-2">
                Adresse e-mail
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full h-12 px-4 border-2 border-gray-200 rounded-lg font-['Lato'] focus:border-[#D4B254] focus:outline-none transition-colors text-black"
                placeholder="votre@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-['Lato'] font-medium text-[#2C5545] mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full h-12 px-4 pr-12 border-2 border-gray-200 rounded-lg font-['Lato'] focus:border-[#D4B254] focus:outline-none transition-colors text-black"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#2C5545]"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {activeTab === 'signup' && (
              <div>
                <label className="block text-sm font-['Lato'] font-medium text-[#2C5545] mb-2">
                  Confirmer le mot de passe
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full h-12 px-4 border-2 border-gray-200 rounded-lg font-['Lato'] focus:border-[#D4B254] focus:outline-none transition-colors text-black"
                  placeholder="••••••••"
                />
              </div>
            )}

            {activeTab === 'signin' && (
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-[#D4B254] border-gray-300 rounded focus:ring-[#D4B254]"
                  />
                  <span className="text-sm font-['Lato'] text-gray-600">Se souvenir de moi</span>
                </label>
                <Link href="/forgot-password" className="text-sm font-['Lato'] text-[#D4B254] hover:underline">
                  Mot de passe oublié ?
                </Link>
              </div>
            )}

            <button
              type="submit"
              className="w-full h-12 bg-[#2C5545] hover:bg-[#1a3329] text-white font-['Lato'] font-bold text-sm uppercase rounded-lg transition-all duration-300 shadow-[0_4px_12px_rgba(44,85,69,0.15)] hover:shadow-[0_6px_20px_rgba(44,85,69,0.25)] transform hover:-translate-y-0.5"
            >
              {activeTab === 'signin' ? 'SE CONNECTER' : 'CRÉER MON COMPTE'}
            </button>
          </form>

          {/* Bottom Link */}
          <div className="mt-6 text-center">
            <span className="text-sm font-['Lato'] text-gray-600">
              {activeTab === 'signin' ? "Pas encore de compte ? " : "Déjà un compte ? "}
              <button
                onClick={() => setActiveTab(activeTab === 'signin' ? 'signup' : 'signin')}
                className="text-[#D4B254] hover:underline font-medium"
              >
                {activeTab === 'signin' ? 'Créer un compte' : 'Se connecter'}
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
