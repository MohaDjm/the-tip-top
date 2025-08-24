import Link from 'next/link';

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#F5F1E6]">
      {/* Header */}
      <div className="bg-[#2C5545] text-white py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/" className="inline-flex items-center text-white hover:text-[#D4B254] transition-colors mb-4">
            <span className="mr-2">←</span>
            Retour à l'accueil
          </Link>
          <nav className="flex space-x-6">
            <Link href="/legal" className="text-white hover:text-[#D4B254] transition-colors">
              Mentions Légales
            </Link>
            <Link href="/legal/cgu" className="text-white hover:text-[#D4B254] transition-colors">
              CGU
            </Link>
            <Link href="/legal/rgpd" className="text-white hover:text-[#D4B254] transition-colors">
              RGPD
            </Link>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  )
}
