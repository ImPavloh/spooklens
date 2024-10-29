'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

import { motion } from 'framer-motion'
import { FaLock, FaHome } from 'react-icons/fa'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

import { useLanguage } from '@/utils/LanguageContext'

export default function ErrorPage({
  isPrivate = false,
}: {
  isPrivate?: boolean
}) {
  const router = useRouter()
  const [isShaking, setIsShaking] = useState(false)
  const { language, translations } = useLanguage()
  const t = translations[language].errorPage

  useEffect(() => {
    if (!isPrivate) {
      const redirectTimer = setTimeout(() => {
        router.push('/')
      }, 5000)

      return () => clearTimeout(redirectTimer)
    }
  }, [router, isPrivate])

  const handleShake = () => {
    setIsShaking(true)
    setTimeout(() => setIsShaking(false), 820)
  }

  const containerVariants = {
    shake: {
      x: [0, -10, 10, -10, 10, 0],
      transition: { duration: 0.4 },
    },
  }

  const floatVariants = {
    float: {
      y: [0, -10, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  }

  const lockVariants = {
    pulse: {
      scale: [1, 1.1, 1],
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  }

  return (
    <div className="min-h-screen bg-gray-900 text-orange-200 p-4 flex items-center justify-center">
      <Card className="w-full max-w-md bg-gray-800 border-2 border-orange-500 shadow-lg shadow-orange-500/20">
        <CardHeader>
          <CardTitle className="text-3xl font-halloween text-orange-500 flex items-center justify-center space-x-2">
            {isPrivate ? (
              <motion.div variants={lockVariants} animate="pulse">
                <FaLock className="h-8 w-8" aria-hidden="true" />
              </motion.div>
            ) : (
              <span className="text-6xl">404</span>
            )}
            <span>
              {isPrivate ? t.privateProfileTitle : t.pageNotFoundTitle}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <motion.div
            variants={containerVariants}
            animate={isShaking ? 'shake' : ''}
          >
            <motion.div variants={floatVariants} animate="float">
              <Image
                src="/images/sad-logo2.png"
                className="h-32 w-32 mx-auto mb-8"
                alt={t.logoAlt}
                width={128}
                height={128}
                priority
              />
            </motion.div>
            <p className="text-xl mb-4">
              {isPrivate ? t.privateProfileMessage : t.pageNotFoundMessage}
            </p>
            <p className="text-orange-300 mb-6">
              {isPrivate
                ? t.privateProfileDescription
                : t.pageNotFoundDescription}
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              {isPrivate && (
                <Button
                  onClick={handleShake}
                  className="bg-orange-500 hover:bg-orange-600 text-gray-900"
                  aria-label={t.revealButtonAriaLabel}
                >
                  {t.revealButtonText}
                </Button>
              )}
              <Button
                onClick={() => router.push('/')}
                className="bg-orange-500 hover:bg-orange-600 text-gray-900"
                aria-label={t.homeButtonAriaLabel}
              >
                <FaHome className="mr-2" />
                {isPrivate ? t.homeButtonTextPrivate : t.homeButtonTextPublic}
              </Button>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </div>
  )
}
