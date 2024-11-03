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
    'Pablo Casado Rodríguez',
    'hackathon',
    'Halloween',
    'spooky',
    'scary',
    'stories',
    'candies',
    'Spookify',
  ],
  authors: [{ name: 'Pavloh', url: 'https://github.com/ImPavloh' }],
  openGraph: {
    title: 'SpookLens',
    description:
      'Finalist website in the 2024 Cloudinary + MiduDev Spooky AI Creations Hackathon with Halloween-themed social media interactions and photo editing.',
    url: 'https://spooklens.vercel.app',
    siteName: 'SpookLens',
    images: [
      {
        url: 'https://spooklens.vercel.app/images/screenshots/s1.jpg',
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
    images: ['https://spooklens.vercel.app/images/screenshots/s1.jpg'],
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
    url: 'https://github.com/ImPavloh',
  },
  description:
    'Finalist in the 2024 Cloudinary + MiduDev Spooky AI Creations Hackathon with Halloween-themed interactions.',
  image: 'https://spooklens.vercel.app/images/screenshots/s1.jpg',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://spooklens.vercel.app/search?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
}

const breadcrumbLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://spooklens.vercel.app/home',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Leaderboard',
      item: 'https://spooklens.vercel.app/leaderboard',
    },
  ],
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
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="theme-color" content="#2b184a" />
        <link rel="canonical" href="https://spooklens.vercel.app" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
        />
        <link
          rel="preload"
          href="/images/screenshots/s1.jpg"
          as="image"
          type="image/jpeg"
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
