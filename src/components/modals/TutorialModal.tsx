'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'

import { motion, AnimatePresence } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  FaThumbsUp,
  FaComments,
  FaTrophy,
  FaFlask,
  FaCandyCane,
  FaGlobe,
  FaLevelUpAlt,
} from 'react-icons/fa'
import { GiPumpkin, GiSpiderWeb } from 'react-icons/gi'

interface Feature {
  title: string
  description: string
  color?: string
  image?: string
  icon?: React.ElementType
  isSeparator?: boolean
}

interface Separator {
  isSeparator: true
  title: string
}

interface TutorialModalProps {
  isOpen: boolean
  onClose: () => void
}

type Step = Feature | Separator

const currentFeatures: Feature[] = [
  {
    title: 'Welcome to SpookLens!',
    description:
      "Prepare for a spine-tingling Halloween adventure! Let's uncover the eerie features of our haunted app.",
    color: 'text-purple-500',
    image: '/images/logo2.png',
  },
  {
    title: 'Trick or Treat',
    description:
      "Engage in our spooky 'Trick or Treat' feature! Choose 'Treat' for a chance to earn candies or even a rare potion. Pick 'Trick' to transform your photo with haunting effects!",
    icon: FaThumbsUp,
    color: 'text-red-500',
  },
  {
    title: 'Capture Your Ghostly Glamour',
    description:
      'Snap a photo of your Halloween transformation. Our AI-powered Cloudinary editor adds an extra layer of fright to your look!',
    color: 'text-green-500',
    image: '/images/camera-logo2.png',
  },
  {
    title: 'Global Coven Chat',
    description:
      'Join our worldwide witches brew of conversation. Share your Halloween escapades with fellow creatures of the night from every dark corner of the globe!',
    icon: FaGlobe,
    color: 'text-blue-500',
  },
  {
    title: 'Candy Cauldron Leaderboard',
    description:
      "Compete in a global ranking to see who's the true Halloween champion!",
    icon: FaTrophy,
    color: 'text-yellow-500',
  },
  {
    title: 'Spooky Profiles',
    description:
      "Discover spooky profiles from fellow spirits and see what they're up to!",
    icon: FaComments,
    color: 'text-yellow-500',
  },
]

const futureFeatures: Feature[] = [
  {
    title: 'Brew Magical Potions',
    description:
      'In the future, you will collect candy to concoct powerful potions. These elixirs will enhance your photos with supernatural effects or unlock hidden features.',
    icon: FaFlask,
    color: 'text-teal-500',
  },
  {
    title: 'Haunted Candy Store',
    description:
      'Im preparing to stock shelves with otherworldly treats. In the future, you will exchange your hard-earned candy for potions, spells and exclusive prizes.',
    icon: FaCandyCane,
    color: 'text-pink-500',
  },
  {
    title: 'Séance Chats',
    description:
      'Im working on private chats! Soon, you will be able to commune with other spirits in one-on-one conversations, forging alliances with fellow Halloween enthusiasts.',
    icon: FaComments,
    color: 'text-green-500',
  },
  {
    title: 'Evolve Your Inner Monster',
    description:
      'As SpookLens grows, you will unlock new ranks and levels. Each milestone will bring you closer to becoming the ultimate creature of the night. Stay tuned for this exciting feature!',
    icon: FaLevelUpAlt,
    color: 'text-orange-500',
  },
]

const allSteps: Step[] = [
  ...currentFeatures,
  { isSeparator: true, title: 'Coming Attractions' },
  ...futureFeatures,
  {
    title: 'Sweet Beginnings',
    description:
      'As a special welcome, when you register for SpookLens, you will receive 10 candies to start your spooky journey! Begin collecting treats and casting tricks right away!',
    icon: FaCandyCane,
    color: 'text-pink-500',
  },
]

export default function TutorialModal({ isOpen, onClose }: TutorialModalProps) {
  const [currentStep, setCurrentStep] = useState<number>(0)
  const currentFeature: Step = allSteps[currentStep]

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0)
    }
  }, [isOpen])

  const handleNext = (): void => {
    if (currentStep < allSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onClose()
    }
  }

  const handlePrevious = (): void => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const progress: number = ((currentStep + 1) / allSteps.length) * 100

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] w-[95vw] h-[60vh] max-h-[600px] p-0 bg-gray-900 text-orange-200 border-2 border-orange-500 rounded-lg shadow-lg shadow-orange-500/20 overflow-hidden">
        <div className="flex flex-col h-full">
          <DialogHeader className="p-4 sm:p-6 bg-gray-800 border-b border-orange-500/30">
            <DialogTitle className="text-2xl sm:text-3xl font-halloween text-orange-500 flex items-center justify-center">
              <motion.div
                animate={{ rotate: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <GiPumpkin className="mr-2 h-6 w-6 sm:h-8 sm:w-8" />
              </motion.div>
              SpookLens Grimoire
              <motion.div
                animate={{ rotate: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              >
                <GiSpiderWeb className="ml-2 h-6 w-6 sm:h-8 sm:w-8" />
              </motion.div>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-grow overflow-hidden p-4 sm:p-6">
            <AnimatePresence mode="wait">
              {currentFeature.isSeparator ? (
                <motion.div
                  key="separator"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center justify-center h-full"
                >
                  <h2 className="text-2xl sm:text-3xl font-bold text-orange-400 mb-4 text-center">
                    {currentFeature.title}
                  </h2>
                  <p className="text-sm sm:text-base text-orange-200 text-center max-w-md">
                    Behold the mystical features that await in the shadows.
                    These spectral wonders are still materializing, but will
                    soon haunt your SpookLens experience!
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center justify-center h-full"
                >
                  <motion.div
                    className="mb-4 sm:mb-6 relative w-24 h-24 sm:w-30 sm:h-30 flex items-center justify-center"
                    animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    {currentFeature.image ? (
                      <Image
                        src={currentFeature.image}
                        alt={currentFeature.title}
                        width={150}
                        height={150}
                        className="object-contain rounded-lg filter drop-shadow-[0_0_20px_rgba(255,165,0,0.5)]"
                      />
                    ) : currentFeature.icon ? (
                      <currentFeature.icon
                        className={`text-5xl sm:text-7xl ${currentFeature.color}`}
                      />
                    ) : null}
                  </motion.div>
                  <h3 className="text-xl sm:text-2xl font-bold text-orange-400 mb-2 sm:mb-4 text-center">
                    {currentFeature.title}
                  </h3>
                  <p className="text-sm sm:text-base text-orange-200 text-balance text-center max-w-md">
                    {currentFeature.description}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="p-4 sm:p-6 bg-gray-800 border-t border-orange-500/30">
            <Progress value={progress} className="mb-4" />
            <div className="flex justify-between items-center">
              <Button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="bg-purple-600 hover:bg-purple-700 text-white transition-all duration-300 ease-in-out transform hover:scale-105 text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2"
              >
                Previous
              </Button>
              <div className="flex justify-center">
                {allSteps.map((_, index) => (
                  <motion.div
                    key={index}
                    className={`w-2 sm:w-4 h-1 sm:h-2 rounded-full mx-0.5 sm:mx-1 cursor-pointer ${
                      index === currentStep ? 'bg-orange-500' : 'bg-gray-600'
                    }`}
                    whileHover={{ scale: 1.2 }}
                    onClick={() => setCurrentStep(index)}
                  />
                ))}
              </div>
              <Button
                onClick={handleNext}
                className="bg-orange-500 hover:bg-orange-600 text-white transition-all duration-300 ease-in-out transform hover:scale-105 min-w-[60px] sm:min-w-[90px] text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2"
              >
                {currentStep === allSteps.length - 1 ? 'Finish' : 'Next'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
