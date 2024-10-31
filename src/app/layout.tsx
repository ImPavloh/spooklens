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
  description:
    'Finalist in the 2024 Cloudinary + MiduDev Spooky AI Hackathon. Join Halloween-themed social media with AI photo editing, achievements, and global chat!',
  keywords: [
    'spooklens',
    'SpookLens',
    'Halloween app',
    'AI-powered social media',
    'photo editing',
    'global chat',
    'Cloudinary',
    'MiduDev',
    'hackathon finalist',
    'Pavloh',
    'hackathon',
    'Halloween',
    'spooky',
    'scary',
    'stories',
    'candies',
    'Spookify',
  ],
  authors: [{ name: 'Pavloh', url: 'https://github.com/Pavloh' }],
  openGraph: {
    title: 'SpookLens',
    description:
      'Finalist website in the 2024 Cloudinary + MiduDev Spooky AI Creations Hackathon with Halloween-themed social media interactions and photo editing.',
    url: 'https://spooklens.vercel.app',
    siteName: 'SpookLens',
    images: [
      {
        url: 'https://spooklens.vercel.app/images/screenshots/s3.jpg',
        width: 1200,
        height: 630,
        alt: 'SpookLens app screenshot',
      },
    ],
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SpookLens',
    description:
      'Join SpookLens, a hackathon finalist in spooky AI social media with photo editing and global chat.',
    images: ['https://spooklens.vercel.app/images/screenshots/s3.jpg'],
    site: '@SpookLens',
    creator: '@impavloh',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/images/logo.png',
    apple: '/images/logo.png',
  },
  manifest: '/manifest.json',
  robots: 'index, follow',
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  url: 'https://spooklens.vercel.app',
  name: 'SpookLens',
  author: {
    '@type': 'Person',
    name: 'Pavloh',
    url: 'https://github.com/Pavloh',
  },
  description:
    'Finalist in the 2024 Cloudinary + MiduDev Spooky AI Creations Hackathon with Halloween-themed interactions.',
  image: 'https://spooklens.vercel.app/images/screenshots/s3.jpg',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://spooklens.vercel.app/search?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html className={breeSerif.className}>
      <head>
      <meta name="google-site-verification" content="MwDtcW9VYqfgR5LrqYTzwUtwEslW1xtqu3PgSMt7ods" /> 
      // Si en el futuro se adquiere un dominio personalizado:
      // modificar el DNS para la verificación de Google (y eleminar este meta)
      // agregar una política de privacidad en la web
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href="https://spooklens.vercel.app" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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
