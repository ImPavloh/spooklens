'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  FiCamera,
  FiMessageSquare,
  FiMusic,
  FiShoppingBag,
} from 'react-icons/fi'
import { FaTrophy, FaGithub, FaTwitter, FaCloudversify } from 'react-icons/fa'
import { useLanguage } from '@/utils/LanguageContext'

import ScrollIndicator from '@/components/extras/ScrollIndicator'
import HauntedCarousel from '@/components/extras/HauntedCarousel'
import BackgroundAnimation from '@/components/extras/BackgroundAnimation'

const TutorialModal = dynamic(
  () => import('@/components/modals/TutorialModal'),
  { ssr: false },
)

interface FeatureCardProps {
  icon: React.FC
  title: string
  description: string
  delay: number
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon: Icon,
  title,
  description,
  delay,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="bg-gray-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-lg shadow-lg border border-orange-500/20 hover:border-orange-500/50 transition-all duration-300 group"
  >
    <span className="flex items-center justify-center text-3xl sm:text-4xl text-orange-500 mb-4 group-hover:scale-110 transition-transform duration-300">
      <Icon aria-hidden="true" />
    </span>
    <h2 className="text-lg sm:text-xl font-bold text-orange-400 mb-2">
      {title}
    </h2>
    <p className="text-orange-200 text-xs sm:text-sm">{description}</p>
  </motion.div>
)

export default function Component() {
  const [isTutorialOpen, setIsTutorialOpen] = useState(false)
  const [disableBackgroundImage, setDisableBackgroundImage] = useState(false)
  const { language, translations } = useLanguage()

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial')
    if (!hasSeenTutorial) {
      setIsTutorialOpen(true)
      localStorage.setItem('hasSeenTutorial', 'true')
    }

    const savedSettings = localStorage.getItem('localSettings')
    if (savedSettings) {
      const { disableBackgroundImage } = JSON.parse(savedSettings)
      setDisableBackgroundImage(disableBackgroundImage)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(
      'localSettings',
      JSON.stringify({ disableBackgroundImage }),
    )
  }, [disableBackgroundImage])

  const t = translations[language]

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 text-orange-100">
      {!disableBackgroundImage && (
        <BackgroundAnimation
          numWebs={20}
          webColor="text-orange-300"
          opacity={0.15}
        />
      )}

      <TutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
      />

      <div className="container mx-auto px-4 pt-16 sm:pt-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-6"
        >
          <motion.h1
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-wider py-4 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-purple-600 mb-2 relative inline-block drop-shadow-[0_5px_3px_rgba(0,0,0,0.4)]"
          >
            SpookLens
            <motion.span
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
              transition={{
                opacity: { delay: 0.5, duration: 0.5 },
                y: {
                  duration: 2,
                  repeat: Infinity,
                  repeatType: 'loop',
                  ease: 'easeInOut',
                },
                rotate: {
                  duration: 2,
                  repeat: Infinity,
                  repeatType: 'loop',
                  ease: 'easeInOut',
                },
              }}
              className="absolute sm:-top-4 -right-16 text-3xl sm:text-5xl"
            >
              <Image
                src="/images/logo2.png"
                alt={t.common.logoAlt}
                draggable="false"
                width={60}
                height={60}
                className="sm:w-20 sm:h-20"
                priority
              />
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-lg sm:text-xl md:text-2xl text-orange-300 mb-6 drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]"
          >
            {t.landing.tagline}
          </motion.p>

          <Button
            asChild
            className="bg-gradient-to-r from-orange-500 to-purple-600 text-white hover:from-orange-600 hover:to-purple-700 text-base sm:text-lg md:text-xl py-2 sm:py-3 md:py-4 px-4 sm:px-6 md:px-8 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            <Link href="/home">{t.landing.ctaButton}</Link>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-8"
        >
          <HauntedCarousel />
        </motion.div>

        <ScrollIndicator />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-16">
          {t.features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={
                [
                  FiCamera,
                  FiMessageSquare,
                  FaTrophy,
                  FiMusic,
                  FiShoppingBag,
                  FaCloudversify,
                ][index]
              }
              title={feature.title}
              description={feature.description}
              delay={0.2 * (index + 1)}
            />
          ))}
        </div>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="text-center bg-gray-800/30 backdrop-blur-sm p-4 sm:p-8 rounded-lg shadow-lg border border-purple-500/20 mb-16"
        >
          <h2 className="text-2xl sm:text-3xl font-halloween text-purple-400 mb-4">
            {t.cloudinary.title}
          </h2>
          <Image
            src="/images/cloudinary-logo.png"
            alt={t.cloudinary.logoAlt}
            className="mx-auto rounded-lg shadow-sm mb-6"
            draggable="false"
            width={150}
            height={38}
            style={{ width: 'auto', height: 'auto' }}
            priority
          />
          <p className="text-base sm:text-lg text-orange-300 mb-8">
            {t.cloudinary.description}
          </p>
          <Button
            asChild
            className="bg-gradient-to-r from-orange-500 to-purple-600 text-white hover:from-orange-600 hover:to-purple-700 text-base sm:text-lg py-2 px-4 sm:px-6 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            <Link
              href="https://cloudinary.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t.cloudinary.ctaButton}
            </Link>
          </Button>
        </motion.section>

        <motion.footer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="text-center text-orange-300 mt-16 pt-6 border-t border-orange-500/20"
        >
          <p className="mb-4 text-sm sm:text-base">
            {t.footer.madeBy}{' '}
            <a
              href="https://www.x.com/impavloh"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-400 hover:underline"
            >
              Pavloh
            </a>{' '}
            - {t.footer.finalistProject}{' '}
            <a
              href="https://cloudinary.com/blog/cloudinary-cloudcreate-spooky-ai-hackathon"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-400 hover:underline"
            >
              {t.footer.hackathonName}
            </a>
          </p>
          <div className="flex justify-center space-x-4 mb-6">
            <a
              href="https://x.com/impavloh"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-400 hover:text-orange-500 transition-colors duration-300"
              aria-label={t.footer.twitterAria}
            >
              <FaTwitter className="w-5 h-5 sm:w-6 sm:h-6" />
            </a>
            <a
              href="https://github.com/impavloh"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-400 hover:text-orange-500 transition-colors duration-300"
              aria-label={t.footer.githubAria}
            >
              <FaGithub className="w-5 h-5 sm:w-6 sm:h-6" />
            </a>
          </div>
        </motion.footer>
      </div>
    </main>
  )
}
