import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import CookieConsent from "@/components/CookieConsent";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    default: "Thé Tip Top - Jeu Concours 10 ans, 10 boutiques, 100% gagnant",
    template: "%s | Thé Tip Top"
  },
  description: "Participez au grand jeu-concours Thé Tip Top ! 10 ans, 10 boutiques, 100% gagnant. Tentez votre chance et gagnez des thés premium, infuseurs et coffrets découverte.",
  keywords: [
    "thé",
    "jeu concours",
    "thé premium",
    "infuseur",
    "boutique thé",
    "thé signature",
    "thé détox",
    "coffret thé",
    "Thé Tip Top",
    "100% gagnant"
  ],
  authors: [{ name: "Thé Tip Top" }],
  creator: "Thé Tip Top",
  publisher: "Thé Tip Top",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NODE_ENV === 'production' ? 'https://164.68.103.88' : 'http://localhost:3001'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Thé Tip Top - Jeu Concours 100% gagnant",
    description: "Participez au grand jeu-concours Thé Tip Top ! 10 ans, 10 boutiques, 100% gagnant.",
    url: '/',
    siteName: 'Thé Tip Top',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: '/assets/images/logos/logo.png',
        width: 1200,
        height: 630,
        alt: 'Thé Tip Top - Jeu Concours',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Thé Tip Top - Jeu Concours 100% gagnant",
    description: "Participez au grand jeu-concours Thé Tip Top ! 10 ans, 10 boutiques, 100% gagnant.",
    images: ['/assets/images/logos/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
