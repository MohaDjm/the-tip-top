'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 15,
    minutes: 23,
    seconds: 45
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const gains = [
    { name: 'Infuseur à thé', percentage: 60, icon: '🌺', description: 'Un infuseur à thé pratique pour savourer vos thés préférés' },
    { name: 'Thé détox 100g', percentage: 20, icon: '🍃', description: 'Un thé détox de 100g pour une pause bien-être' },
    { name: 'Thé signature 100g', percentage: 10, icon: '✨', description: 'Notre thé signature exclusif en format 100g' },
    { name: 'Coffret découverte 39€', percentage: 6, icon: '🎁', description: 'Un coffret découverte d\'une valeur de 39€' },
    { name: 'Coffret premium 69€', percentage: 4, icon: '🏆', description: 'Un coffret premium d\'une valeur de 69€' },
    { name: 'Un an de thé - 360€', percentage: 'Tirage', icon: '👑', description: 'Un an de thé offert d\'une valeur de 360€' }
  ];

  const steps = [
    { title: 'Achetez vos thés', icon: '🛒', description: 'Rendez-vous dans l\'une de nos 10 boutiques' },
    { title: 'Récupérez votre code', icon: '🎫', description: 'Votre code unique se trouve sur votre ticket de caisse' },
    { title: 'Saisissez votre code', icon: '⌨️', description: 'Connectez-vous et saisissez votre code sur notre site' },
    { title: 'Réclamez votre lot', icon: '🎁', description: 'Présentez-vous en boutique avec votre QR code pour récupérer votre lot' }
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-30 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Image 
                src="/assets/images/logos/logo.png" 
                alt="Thé Tip Top"
                width={40}
                height={20}
                className="object-contain"
              />
              <h1 className="text-[#B8A049] font-['Playfair_Display'] text-xl font-bold tracking-wide">
                THÉ TIP TOP
              </h1>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="#" className="text-[#2C5545] font-['Lato'] hover:text-[#D4B254] transition-colors">Accueil</Link>
              <Link href="#" className="text-[#2C5545] font-['Lato'] hover:text-[#D4B254] transition-colors">Nos gains</Link>
              <Link href="#" className="text-[#2C5545] font-['Lato'] hover:text-[#D4B254] transition-colors">Nos boutiques</Link>
              <Link href="#" className="text-[#2C5545] font-['Lato'] hover:text-[#D4B254] transition-colors">Contact</Link>
              <Link href="/auth">
                <button className="bg-[#D4B254] hover:bg-[#B8A049] text-black font-['Lato'] font-bold text-sm px-6 py-2 rounded-full transition-all duration-300">
                  MON COMPTE
                </button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#2C5545] to-[#1a3329] min-h-screen flex items-center justify-center overflow-hidden">
        {/* Hero Content */}
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-6">
          <h1 className="font-['Playfair_Display'] text-6xl md:text-7xl font-bold mb-2 leading-tight">
            10 ans, 10 boutiques,
          </h1>
          <h2 className="font-['Playfair_Display'] text-6xl md:text-7xl font-bold text-[#D4B254] mb-8 leading-tight">
            100% gagnant
          </h2>
          
          <p className="text-lg md:text-xl mb-12 font-['Lato'] max-w-2xl mx-auto opacity-90">
            Célébrez avec nous l'ouverture de notre 10ème boutique à Nice
          </p>

          {/* Countdown */}
          <div className="mb-12">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-[#D4B254] text-black">
              <div className="text-center">
                <div className="text-2xl font-bold font-mono">
                  {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
                </div>
                <div className="text-xs mt-1 opacity-80">TEMPS RESTANT</div>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <Link href="/auth">
            <button className="bg-[#D4B254] hover:bg-[#B8A049] text-black font-['Lato'] font-bold text-sm px-8 py-3 rounded-full transition-all duration-300 shadow-[0_4px_12px_rgba(212,178,84,0.3)] hover:shadow-[0_6px_20px_rgba(212,178,84,0.4)] transform hover:-translate-y-1 uppercase tracking-wide">
              PARTICIPER MAINTENANT
            </button>
          </Link>
        </div>
      </section>

      {/* Gains Section */}
      <section className="py-20 bg-[#F5F1E6]">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="font-['Playfair_Display'] text-4xl md:text-5xl font-bold text-center text-[#2C5545] mb-16">
            Découvrez vos gains
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gains.map((gain, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 cursor-pointer group relative"
              >
                {/* Percentage Badge */}
                <div className="absolute -top-3 -right-3 w-12 h-12 bg-[#2C5545] text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {typeof gain.percentage === 'number' ? `${gain.percentage}%` : gain.percentage === 'Tirage' ? '🎯' : gain.percentage}
                </div>
                
                <div className="text-center">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {gain.icon}
                  </div>
                  <h3 className="font-['Lato'] font-bold text-lg text-[#2C5545] mb-3">
                    {gain.name}
                  </h3>
                  <p className="text-sm text-gray-600 font-['Lato'] leading-relaxed">
                    {gain.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Participate Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="font-['Playfair_Display'] text-4xl md:text-5xl font-bold text-center text-[#2C5545] mb-16">
            Comment participer ?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center relative">
                <div className="relative z-10 group">
                  <div className="w-20 h-20 rounded-full bg-[#D4B254] flex items-center justify-center mx-auto mb-6 text-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    {step.icon}
                  </div>
                  <h3 className="font-['Lato'] font-bold text-lg text-[#2C5545] mb-3">
                    {step.title}
                  </h3>
                  <p className="text-[#3A3A3A] font-['Lato'] text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-20 bg-[#2C5545]">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="font-['Playfair_Display'] text-3xl md:text-4xl font-bold text-white mb-4">
            Prêt à tenter votre chance ?
          </h2>
          <p className="text-white/80 font-['Lato'] mb-8">
            100% des participants gagnent ! Ne manquez pas cette opportunité unique.
          </p>
          <Link href="/auth">
            <button className="bg-[#D4B254] hover:bg-[#B8A049] text-black font-['Lato'] font-bold text-sm px-8 py-3 rounded-full transition-all duration-300 shadow-[0_4px_12px_rgba(212,178,84,0.3)] hover:shadow-[0_6px_20px_rgba(212,178,84,0.4)] transform hover:-translate-y-1 uppercase tracking-wide">
              COMMENCER À JOUER
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a3329] text-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Logo et Description */}
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-3 mb-4">
                <Image 
                  src="/assets/images/logos/logo.png" 
                  alt="Thé Tip Top"
                  width={40}
                  height={20}
                  className="object-contain"
                />
                <h3 className="text-[#D4B254] font-['Playfair_Display'] text-lg font-bold">
                  THÉ TIP TOP
                </h3>
              </div>
              <p className="text-white/80 font-['Lato'] text-sm leading-relaxed mb-4">
                Depuis 10 ans, nous vous proposons les meilleurs thés du monde dans nos boutiques. 
                Découvrez notre sélection premium et participez à notre jeu 100% gagnant !
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-white/60 hover:text-[#D4B254] transition-colors">
                  <span className="text-xl">📘</span>
                </a>
                <a href="#" className="text-white/60 hover:text-[#D4B254] transition-colors">
                  <span className="text-xl">📷</span>
                </a>
                <a href="#" className="text-white/60 hover:text-[#D4B254] transition-colors">
                  <span className="text-xl">🐦</span>
                </a>
              </div>
            </div>

            {/* Navigation */}
            <div>
              <h4 className="font-['Playfair_Display'] text-lg font-bold text-[#D4B254] mb-4">Navigation</h4>
              <ul className="space-y-2">
                <li><Link href="/" className="text-white/80 hover:text-[#D4B254] transition-colors font-['Lato'] text-sm">Accueil</Link></li>
                <li><Link href="#" className="text-white/80 hover:text-[#D4B254] transition-colors font-['Lato'] text-sm">Nos Gains</Link></li>
                <li><Link href="#" className="text-white/80 hover:text-[#D4B254] transition-colors font-['Lato'] text-sm">Comment Participer</Link></li>
                <li><Link href="/auth" className="text-white/80 hover:text-[#D4B254] transition-colors font-['Lato'] text-sm">Mon Compte</Link></li>
                <li><Link href="#" className="text-white/80 hover:text-[#D4B254] transition-colors font-['Lato'] text-sm">Règlement du Jeu</Link></li>
              </ul>
            </div>

            {/* Nos Boutiques */}
            <div>
              <h4 className="font-['Playfair_Display'] text-lg font-bold text-[#D4B254] mb-4">Nos Boutiques</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-white/80 hover:text-[#D4B254] transition-colors font-['Lato'] text-sm">Paris - Marais</a></li>
                <li><a href="#" className="text-white/80 hover:text-[#D4B254] transition-colors font-['Lato'] text-sm">Lyon - Presqu&apos;île</a></li>
                <li><a href="#" className="text-white/80 hover:text-[#D4B254] transition-colors font-['Lato'] text-sm">Marseille - Vieux Port</a></li>
                <li><a href="#" className="text-white/80 hover:text-[#D4B254] transition-colors font-['Lato'] text-sm">Nice - Centre</a></li>
                <li><a href="#" className="text-white/80 hover:text-[#D4B254] transition-colors font-['Lato'] text-sm">Voir toutes nos boutiques</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-['Playfair_Display'] text-lg font-bold text-[#D4B254] mb-4">Contact</h4>
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <span className="text-[#D4B254] mt-1">📍</span>
                  <p className="text-white/80 font-['Lato'] text-sm">
                    18 rue de la Paix<br />
                    75002 Paris, France
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[#D4B254]">📞</span>
                  <a href="tel:+33123456789" className="text-white/80 hover:text-[#D4B254] transition-colors font-['Lato'] text-sm">
                    +33 1 23 45 67 89
                  </a>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[#D4B254]">✉️</span>
                  <a href="mailto:contact@thetiptop.fr" className="text-white/80 hover:text-[#D4B254] transition-colors font-['Lato'] text-sm">
                    contact@thetiptop.fr
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Séparateur */}
          <div className="border-t border-white/20 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex flex-wrap justify-center md:justify-start space-x-6">
                <Link href="#" className="text-white/60 hover:text-[#D4B254] transition-colors font-['Lato'] text-sm">
                  Mentions Légales
                </Link>
                <Link href="#" className="text-white/60 hover:text-[#D4B254] transition-colors font-['Lato'] text-sm">
                  Politique de Confidentialité
                </Link>
                <Link href="#" className="text-white/60 hover:text-[#D4B254] transition-colors font-['Lato'] text-sm">
                  CGV
                </Link>
                <Link href="#" className="text-white/60 hover:text-[#D4B254] transition-colors font-['Lato'] text-sm">
                  Cookies
                </Link>
              </div>
              <p className="text-white/60 font-['Lato'] text-sm">
                © 2024 Thé Tip Top. Tous droits réservés.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
