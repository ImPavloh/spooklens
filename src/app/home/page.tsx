'use client'

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaGhost, FaSkull } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

import ChatRoom from '@/components/ChatRoom'
import MusicPlayer from '@/components/MusicPlayer'
import AuthModal from '@/components/modals/AuthModal'
import TrickOrTreatModal from '@/components/modals/TrickOrTreatModal'
import SpookyUploaderModal from '@/components/modals/SpookyUploaderModal'
import BackgroundAnimation from '@/components/extras/BackgroundAnimation'
import MyViewer from '@/components/MyViewer'

const MemoizedChatRoom = React.memo(ChatRoom)
const MemoizedMusicPlayer = React.memo(MusicPlayer)
interface LocalSettings {
  disableBackgroundImage: boolean
  disableMusicPlayerAnimations: boolean
  disableChatBackgroundAnimations: boolean
  musicPlayerVolume: number
}

export default function Page() {
  const [isTrickOrTreatModalOpen, setTrickOrTreatModalOpen] = useState(false)
  const [isUploadModalOpen, setUploadModalOpen] = useState(false)
  const [isAuthModalOpen, setAuthModalOpen] = useState(false)
  const [localSettings] = useState<LocalSettings>(() => {
    const savedSettings = localStorage.getItem('localSettings')
    return savedSettings
      ? JSON.parse(savedSettings)
      : {
          disableBackgroundImage: false,
          disableMusicPlayerAnimations: false,
          disableChatBackgroundAnimations: false,
          musicPlayerVolume: 50,
        }
  })
  const hauntedEffectRef = useRef(false)
  const [, forceUpdate] = useState({})
  const [viewerData, setViewerData] = useState({
    imageUrl: '',
    title: '',
    description: '',
    lastPhotoTimestamp: '',
  })

  const openUploadModal = useCallback(() => setUploadModalOpen(true), [])
  const closeUploadModal = useCallback(() => setUploadModalOpen(false), [])

  const openAuthModal = useCallback(() => {
    setAuthModalOpen(true)
  }, [])
  const closeAuthModal = useCallback(() => {
    setAuthModalOpen(false)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      hauntedEffectRef.current = true
      forceUpdate({})
      setTimeout(() => {
        hauntedEffectRef.current = false
        forceUpdate({})
      }, 1000)
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    localStorage.setItem('localSettings', JSON.stringify(localSettings))
  }, [localSettings])

  const handleImageFinalized = useCallback(
    (imageData: {
      url: string
      title: string
      description: string
      timestamp: string
    }) => {
      setViewerData({
        imageUrl: imageData.url,
        title: imageData.title,
        description: imageData.description,
        lastPhotoTimestamp: imageData.timestamp,
      })
    },
    [],
  )

  const backgroundClass = useMemo(
    () =>
      localSettings.disableBackgroundImage
        ? 'bg-gray-900'
        : 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 via-purple-900 to-violet-900',
    [localSettings.disableBackgroundImage],
  )

  const hauntedClass = hauntedEffectRef.current ? 'animate-haunted' : ''

  return (
    <>
      <div
        className={`min-h-screen flex flex-col ${backgroundClass} text-orange-200 overflow-hidden pt-16 ${hauntedClass}`}
      >
        {!localSettings.disableBackgroundImage && (
          <BackgroundAnimation
            numWebs={15}
            webColor="text-orange-300"
            opacity={0.15}
          />
        )}

        <main className="flex-grow flex flex-col items-center justify-center px-4 lg:px-0 relative">
          <div className="relative z-10 w-full max-w-7xl">
            <motion.div
              className="mb-6 text-center relative"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h1 className="text-6xl lg:text-8xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-purple-600 animate-gradient-x drop-shadow-[0_5px_3px_rgba(0,0,0,0.4)]">
                Social Hub
              </h1>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-6 flex justify-center"
            >
              <Button
                className="group relative overflow-hidden rounded-full bg-gradient-to-r from-orange-500 via-red-500 to-purple-600 p-[2px] focus:outline-none hover:shadow-lg hover:shadow-purple-500/50 transition-shadow duration-300"
                onClick={() => setTrickOrTreatModalOpen(true)}
              >
                <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2C9FB_0%,#A5B4FC_50%,#818CF8_100%)]" />
                <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-gray-900 px-8 py-4 text-sm font-medium text-orange-300 backdrop-blur-3xl transition-colors duration-300 group-hover:bg-gray-800">
                  <FaGhost className="mr-2 h-5 w-5 group-hover:animate-pulse" />
                  TRICK OR TREAT
                  <FaSkull className="ml-2 h-5 w-5 group-hover:animate-shake" />
                </span>
              </Button>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <AnimatePresence>
                <motion.div
                  key="chat"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ delay: 0.2 }}
                  className="hidden lg:block h-[600px]"
                >
                  <MemoizedChatRoom
                    username="global"
                    openAuthModal={openAuthModal}
                    localSettings={localSettings}
                    isPrivateChat={false}
                  />
                </motion.div>

                <motion.div
                  key="viewer"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 30 }}
                  transition={{ delay: 0.4 }}
                  className="col-span-1 flex justify-center"
                >
                  <Card className="w-[90%] h-[600px] overflow-hidden shadow-2xl shadow-purple-700/30 [box-shadow:rgba(128,0,128,0.4)_0px_5px,rgba(128,0,128,0.3)_0px_10px,rgba(128,0,128,0.2)_0px_15px,rgba(128,0,128,0.1)_0px_20px,rgba(128,0,128,0.05)_0px_25px] bg-gray-800/50 backdrop-blur-sm">
                    <MyViewer
                      imageUrl={viewerData.imageUrl}
                      title={viewerData.title}
                      description={viewerData.description}
                      lastPhotoTimestamp={viewerData.lastPhotoTimestamp}
                    />
                  </Card>
                </motion.div>

                <motion.div
                  key="music-player"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  transition={{ delay: 0.6 }}
                  className="hidden lg:block h-[600px]"
                >
                  <MemoizedMusicPlayer localSettings={localSettings} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </main>
      </div>

      <SpookyUploaderModal
        isOpen={isUploadModalOpen}
        onClose={closeUploadModal}
        onImageFinalized={handleImageFinalized}
      />

      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />

      <TrickOrTreatModal
        isOpen={isTrickOrTreatModalOpen}
        onClose={() => setTrickOrTreatModalOpen(false)}
        onOpenUploadModal={openUploadModal}
      />
    </>
  )
}
