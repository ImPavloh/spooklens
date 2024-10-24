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
  description: 'Finalist website in the 2024 Cloudinary + MiduDev Spooky AI Creations Hackathon.',
  keywords: [
    'SpookLens',
    'Next.js',
    'Tailwind CSS',
    'Hackathon',
    'Cloudinary',
    'MiduDev',
    'Pavloh',
    'Halloween'
  ],
  authors: [{ name: 'Pavloh' }],
  openGraph: {
    title: 'SpookLens',
    description: 'Finalist website in the 2024 Cloudinary + MiduDev Spooky AI Creations Hackathon.',
    url: 'https://spooklens.vercel.app',
    siteName: 'SpookLens',
    images: [
      {
        url: 'https://spooklens.vercel.app/images/screenshots/s3.jpg',
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
    description: 'Finalist website in the 2024 Cloudinary + MiduDev Spooky AI Creations Hackathon.v',
    images: ['https://spooklens.vercel.app/images/screenshots/s3.jpg'],
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
