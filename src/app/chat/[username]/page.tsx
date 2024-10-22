/* NO IMPLEMENTADO TODAVIA
'use client'

import React, { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { FaArrowLeft } from 'react-icons/fa'
import { auth } from '@/lib/firebase'
import ChatRoom from '@/components/ChatRoom'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import AuthModal from '@/components/modals/AuthModal'
import BackgroundAnimation from '@/components/extras/BackgroundAnimation'

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: 10 },
}

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.4,
}

export default function PrivateChatPage({
  params,
}: {
  params: { username: string }
}) {
  const [isAuthModalOpen, setAuthModalOpen] = useState(false)
  const [localSettings] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('localSettings')
      return savedSettings
        ? JSON.parse(savedSettings)
        : {
            disableBackgroundImage: false,
            disableChatBackgroundAnimations: false,
          }
    }
    return {
      disableBackgroundImage: false,
      disableChatBackgroundAnimations: false,
    }
  })
  const router = useRouter()

  const openAuthModal = useCallback(() => {
    setAuthModalOpen(true)
  }, [])

  const closeAuthModal = useCallback(() => {
    setAuthModalOpen(false)
  }, [])

  const backgroundClass = localSettings.disableBackgroundImage
    ? 'bg-gray-900'
    : 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 via-purple-900 to-violet-900'

  if (!auth.currentUser) {
    return (
      <motion.div
        variants={pageVariants}
        transition={pageTransition}
        initial="initial"
        animate="in"
        exit="out"
        className={`min-h-screen flex items-center justify-center ${backgroundClass}`}
      >
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-orange-500">
              Authentication Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-orange-200">
              You must be logged in to start a private chat.
            </p>
            <Button
              onClick={openAuthModal}
              className="mt-4 bg-orange-500 hover:bg-orange-600"
            >
              Log In / Sign Up
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      variants={pageVariants}
      transition={pageTransition}
      initial="initial"
      animate="in"
      exit="out"
      className={`min-h-screen flex flex-col ${backgroundClass} text-orange-200 overflow-hidden pt-16`}
    >
      {!localSettings.disableBackgroundImage && (
        <BackgroundAnimation
          numWebs={20}
          webColor="text-orange-300"
          opacity={0.15}
        />
      )}

      <main className="flex-grow flex flex-col items-center justify-center px-4 lg:px-0 relative">
        <div className="relative z-10 w-full max-w-4xl">
          <motion.div
            className="mb-6 text-center relative"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h1 className="text-4xl lg:text-6xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-purple-600 animate-gradient-x drop-shadow-[0_5px_3px_rgba(0,0,0,0.4)]">
              Private Chat with {params.username}
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ delay: 0.4 }}
            className="w-full"
          >
            <ChatRoom
              username={params.username}
              openAuthModal={openAuthModal}
              localSettings={localSettings}
              isPrivateChat={true}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-6 flex justify-center"
          >
            <Button
              onClick={() => router.push('/')}
              className="group relative overflow-hidden rounded-full bg-gradient-to-r from-orange-500 via-red-500 to-purple-600 p-[2px] focus:outline-none hover:shadow-lg hover:shadow-purple-500/50 transition-shadow duration-300"
            >
              <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2C9FB_0%,#A5B4FC_50%,#818CF8_100%)]" />
              <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-gray-900 px-8 py-4 text-sm font-medium text-orange-300 backdrop-blur-3xl transition-colors duration-300 group-hover:bg-gray-800">
                <FaArrowLeft className="mr-2 h-5 w-5" />
                Back to Home
              </span>
            </Button>
          </motion.div>
        </div>
      </main>

      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
    </motion.div>
  )
}
*/
