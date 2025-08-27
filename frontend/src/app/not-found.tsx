import Link from 'next/link'
import Image from 'next/image'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F5F1E6] flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Logo */}
        <div className="mb-8">
          <Image
            src="/assets/images/logos/logo.png"
            alt="Thé Tip Top"
            width={120}
            height={120}
            className="mx-auto"
          />
        </div>

        {/* Icône 404 stylisée */}
        <div className="mb-8">
          <div className="text-[#D4B254] text-8xl font-bold font-['Playfair_Display'] mb-4">
            404
          </div>
          <div className="w-24 h-1 bg-[#D4B254] mx-auto rounded-full"></div>
        </div>

        {/* Message d'erreur */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#2C5545] mb-4 font-['Playfair_Display']">
            Oups ! Page introuvable
          </h1>
          <p className="text-lg text-gray-600 mb-6 font-['Lato']">
            La page que vous recherchez semble avoir disparu comme une feuille de thé dans l&apos;eau chaude...
          </p>
          <p className="text-gray-500 font-['Lato']">
            Ne vous inquiétez pas, nous avons d&apos;excellentes alternatives à vous proposer !
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <Link
            href="/"
            className="bg-[#D4B254] hover:bg-[#B8A04A] text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg font-['Lato']"
          >
            🏠 Retour à l'accueil
          </Link>
          <Link
            href="/auth"
            className="bg-[#2C5545] hover:bg-[#1F3D32] text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg font-['Lato']"
          >
            🎯 Tenter ma chance
          </Link>
        </div>

        {/* Suggestions */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-[#2C5545] mb-4 font-['Playfair_Display']">
            Que souhaitez-vous faire ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/"
              className="p-4 rounded-lg border-2 border-[#F5F1E6] hover:border-[#D4B254] transition-colors group"
            >
              <div className="text-2xl mb-2">🎲</div>
              <div className="font-semibold text-[#2C5545] group-hover:text-[#D4B254] font-['Lato']">
                Découvrir le jeu
              </div>
            </Link>
            <Link
              href="/legal"
              className="p-4 rounded-lg border-2 border-[#F5F1E6] hover:border-[#D4B254] transition-colors group"
            >
              <div className="text-2xl mb-2">📋</div>
              <div className="font-semibold text-[#2C5545] group-hover:text-[#D4B254] font-['Lato']">
                Mentions légales
              </div>
            </Link>
            <Link
              href="/auth"
              className="p-4 rounded-lg border-2 border-[#F5F1E6] hover:border-[#D4B254] transition-colors group"
            >
              <div className="text-2xl mb-2">👤</div>
              <div className="font-semibold text-[#2C5545] group-hover:text-[#D4B254] font-['Lato']">
                Mon compte
              </div>
            </Link>
          </div>
        </div>

        {/* Citation inspirante */}
        <div className="text-center">
          <blockquote className="text-[#2C5545] italic font-['Playfair_Display'] text-lg">
            &ldquo;Comme le thé, chaque détour peut révéler une saveur inattendue.&rdquo;
          </blockquote>
          <cite className="text-gray-500 text-sm font-['Lato'] mt-2 block">
            - Sagesse Thé Tip Top
          </cite>
        </div>
      </div>
    </div>
  )
}
