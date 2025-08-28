'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navigation from '../components/Navigation';
import { useAnalytics } from '../utils/analytics';

export default function Home() {
  const router = useRouter();
  const { trackPageView, trackCTAClick, trackNewsletterSubscribe } = useAnalytics();
  const [timeLeft, setTimeLeft] = useState({
    hours: 15,
    minutes: 23,
    seconds: 45
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Track page view
    trackPageView('homepage');

    // Check if user is logged in
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

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

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const email = formData.get('email') as string;

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        trackNewsletterSubscribe(email);
        alert('✅ Inscription réussie ! Merci de vous être abonné à notre newsletter.');
        form.reset();
      } else {
        alert('❌ Erreur lors de l\'inscription : ' + (data.message || 'Erreur inconnue'));
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      alert('❌ Erreur de connexion. Veuillez réessayer plus tard.');
    }
  };

  const handleParticipateClick = () => {
    trackCTAClick(isLoggedIn ? 'access-dashboard-hero' : 'participate-now-hero');
    if (isLoggedIn) {
      router.push('/dashboard');
    } else {
      router.push('/auth');
    }
  };

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
    <div className="min-h-screen bg-[#F5F1E6]">
      {/* Navigation */}
      <Navigation />

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
            Célébrez avec nous l&apos;ouverture de notre 10ème boutique à Nice
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
          <button 
            onClick={handleParticipateClick}
            className="bg-[#D4B254] hover:bg-[#B8A049] text-black font-['Lato'] font-bold text-sm px-8 py-3 rounded-full transition-all duration-300 shadow-[0_4px_12px_rgba(212,178,84,0.3)] hover:shadow-[0_6px_20px_rgba(212,178,84,0.4)] transform hover:-translate-y-1 uppercase tracking-wide"
          >
            {isLoggedIn ? 'ACCÉDER À MON ESPACE' : 'PARTICIPER MAINTENANT'}
          </button>
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

      {/* Newsletter Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="font-['Playfair_Display'] text-3xl md:text-4xl font-bold text-[#2C5545] mb-4">
            Restez informé de nos actualités
          </h2>
          <p className="text-gray-600 font-['Lato'] text-lg mb-8">
            Recevez nos dernières nouveautés, offres exclusives et les résultats de nos jeux concours !
          </p>
          
          <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto flex gap-3">
            <input
              type="email"
              name="email"
              placeholder="Votre adresse email"
              required
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-['Lato'] focus:outline-none focus:ring-2 focus:ring-[#2C5545] focus:border-transparent"
            />
            <button
              type="submit"
              className="bg-[#2C5545] text-white px-6 py-3 rounded-lg font-['Lato'] font-semibold hover:bg-[#1a3329] transition-colors"
            >
              S&apos;abonner
            </button>
          </form>
          
          <p className="text-gray-500 font-['Lato'] text-sm mt-4">
            Pas de spam, désabonnement possible à tout moment.
          </p>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-20 bg-[#2C5545]">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="font-['Playfair_Display'] text-3xl md:text-4xl font-bold text-white mb-4">
            Prêt à tenter votre chance ?
          </h2>
          <p className="text-white/90 font-['Lato'] text-lg mb-8">
            Achetez un thé dans l'une de nos boutiques et participez à notre grand jeu concours !
          </p>
          <Link 
            href="/auth" 
            onClick={() => trackCTAClick('participate-now-footer')}
            className="inline-block bg-[#D4B254] text-[#2C5545] px-8 py-4 rounded-lg font-['Lato'] font-semibold text-lg hover:bg-[#C4A244] transition-colors"
          >
            Participer maintenant
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
                <a 
                  href="https://www.facebook.com/profile.php?id=100093205608475" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-[#D4B254] transition-colors"
                  aria-label="Facebook"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a 
                  href="https://www.instagram.com/the.tip.top_/" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-[#D4B254] transition-colors"
                  aria-label="Instagram"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.418-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.928.875 1.418 2.026 1.418 3.323s-.49 2.448-1.418 3.244c-.875.807-2.026 1.297-3.323 1.297zm7.83-9.608c-.807 0-1.418-.611-1.418-1.418s.611-1.418 1.418-1.418 1.418.611 1.418 1.418-.611 1.418-1.418 1.418zm-4.262 9.608c-2.513 0-4.262-1.749-4.262-4.262s1.749-4.262 4.262-4.262 4.262 1.749 4.262 4.262-1.749 4.262-4.262 4.262z"/>
                  </svg>
                </a>
                <a 
                  href="https://x.com/Thetiptopshop" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-[#D4B254] transition-colors"
                  aria-label="X (Twitter)"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a 
                  href="https://www.linkedin.com/in/thetiptop-g7-410ba8261/" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-[#D4B254] transition-colors"
                  aria-label="LinkedIn"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
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
                <Link href="/legal" className="text-white/60 hover:text-[#D4B254] transition-colors font-['Lato'] text-sm">
                  Mentions Légales
                </Link>
                <Link href="/legal/rgpd" className="text-white/60 hover:text-[#D4B254] transition-colors font-['Lato'] text-sm">
                  Politique de Confidentialité
                </Link>
                <Link href="/legal/cgu" className="text-white/60 hover:text-[#D4B254] transition-colors font-['Lato'] text-sm">
                  CGU
                </Link>
                <Link href="/legal/rgpd" className="text-white/60 hover:text-[#D4B254] transition-colors font-['Lato'] text-sm">
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
