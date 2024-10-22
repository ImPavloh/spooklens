import './globals.css'

import { Metadata } from 'next'
import { Bree_Serif } from 'next/font/google'

import { LanguageProvider } from '@/utils/LanguageContext'
import Navbar from '@/components/extras/Navbar'
import ProtectedRoute from '@/components/extras/ProtectedRoute'

const breeSerif = Bree_Serif({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-bree-serif',
  preload: true,
})

export const metadata: Metadata = {
  title: 'SpookLens',
  description: 'Web para la Hackathon de Cloudinary + MiduDev',
  keywords: [
    'SpookLens',
    'Next.js',
    'Tailwind CSS',
    'Hackathon',
    'Cloudinary',
    'MiduDev',
    'Pavloh',
  ],
  authors: [{ name: 'Pavloh' }],
  openGraph: {
    title: 'SpookLens',
    description: 'Web para la Hackathon de Cloudinary x MiduDev',
    url: 'https://spookymatch.vercel.app',
    siteName: 'SpookLens',
    images: [
      {
        url: 'https://spookymatch.vercel.app/images/screenshots/s2.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SpookLens',
    description: 'Web para la Hackathon de Cloudinary + MiduDev',
    images: ['https://spooklens.vercel.app/images/screenshots/s2.jpg'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/images/logo.png',
    apple: '/images/logo.png',
  },
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={breeSerif.className}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-gray-900 text-white">
        <ProtectedRoute>
          <LanguageProvider>
            <Navbar />
            <main>{children}</main>
          </LanguageProvider>
        </ProtectedRoute>
      </body>
    </html>
  )
}
