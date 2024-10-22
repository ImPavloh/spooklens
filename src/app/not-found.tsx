'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { FaLock, FaHome } from 'react-icons/fa'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

export default function ErrorPage({
  isPrivate = false,
}: {
  isPrivate?: boolean
}) {
  const router = useRouter()
  const [isShaking, setIsShaking] = useState(false)

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
            <span>{isPrivate ? 'Private Profile' : 'Page Not Found'}</span>
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
                alt="SpookLens"
                width={128}
                height={128}
                priority
              />
            </motion.div>
            <p className="text-xl mb-4">
              {isPrivate
                ? 'Oops! This profile is hidden in the shadows.'
                : 'Oops! This page has vanished into the spirit realm.'}
            </p>
            <p className="text-orange-300 mb-6">
              {isPrivate
                ? "The user has chosen to keep their profile private. Only the bravest of ghosts can see what's behind this veil of mystery!"
                : "Don't worry, you'll be transported back to the mortal world in 5 seconds..."}
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              {isPrivate && (
                <Button
                  onClick={handleShake}
                  className="bg-orange-500 hover:bg-orange-600 text-gray-900"
                  aria-label="Attempt to reveal profile"
                >
                  Try to Reveal
                </Button>
              )}
              <Button
                onClick={() => router.push('/')}
                className="bg-orange-500 hover:bg-orange-600 text-gray-900"
                aria-label="Go to home page"
              >
                <FaHome className="mr-2" />
                {isPrivate ? 'Go Home' : 'Return to the Haunted Homepage'}
              </Button>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </div>
  )
}
