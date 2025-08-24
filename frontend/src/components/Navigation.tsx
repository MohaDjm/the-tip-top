'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'CLIENT' | 'EMPLOYEE' | 'ADMIN';
}

export default function Navigation() {
  const [user, setUser] = useState<User | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
  };

  const getNavLinks = () => {
    if (!user) {
      return [];
    }

    const baseLinks = [
      { href: '/', label: 'Accueil' },
    ];

    switch (user.role) {
      case 'CLIENT':
        return [
          ...baseLinks,
          { href: '/dashboard', label: 'Mon Espace' },
        ];
      case 'EMPLOYEE':
        return [
          ...baseLinks,
          { href: '/employee', label: 'Interface Employé' },
        ];
      case 'ADMIN':
        return [
          ...baseLinks,
          { href: '/admin', label: 'Administration' },
          { href: '/employee', label: 'Interface Employé' },
        ];
      default:
        return baseLinks;
    }
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <Image 
              src="/assets/images/logos/logo.png" 
              alt="Thé Tip Top"
              width={40}
              height={20}
              className="object-contain"
            />
            <span className="text-[#2C5545] text-xl font-['Playfair_Display'] font-bold">
              Thé Tip Top
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {getNavLinks().map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[#2C5545] hover:text-[#D4B254] font-['Lato'] font-medium transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
            
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-[#2C5545] font-['Lato'] text-sm">
                  Bonjour, {user.firstName}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-[#2C5545] hover:bg-[#1a3329] text-white px-4 py-2 rounded-lg font-['Lato'] font-medium transition-colors duration-200"
                >
                  Déconnexion
                </button>
              </div>
            ) : (
              <Link
                href="/auth"
                className="bg-[#D4B254] hover:bg-[#c4a244] text-white px-6 py-2 rounded-lg font-['Lato'] font-bold transition-colors duration-200"
              >
                Se connecter
              </Link>
            )}
          </div>

          {/* Mobile menu button - only show when not logged in */}
          {!user && (
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-[#2C5545] hover:text-[#D4B254] focus:outline-none focus:text-[#D4B254]"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
              {getNavLinks().map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-3 py-2 text-[#2C5545] hover:text-[#D4B254] font-['Lato'] font-medium transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              
              {user ? (
                <div className="px-3 py-2 border-t border-gray-200 mt-2">
                  <p className="text-[#2C5545] font-['Lato'] text-sm mb-2">
                    Bonjour, {user.firstName}
                  </p>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full bg-[#2C5545] hover:bg-[#1a3329] text-white px-4 py-2 rounded-lg font-['Lato'] font-medium transition-colors duration-200"
                  >
                    Déconnexion
                  </button>
                </div>
              ) : (
                <div className="px-3 py-2 border-t border-gray-200 mt-2">
                  <Link
                    href="/auth"
                    className="block w-full bg-[#D4B254] hover:bg-[#c4a244] text-white px-4 py-2 rounded-lg font-['Lato'] font-bold text-center transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Se connecter
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
