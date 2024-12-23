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
import { useLanguage } from '@/utils/LanguageContext'

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

export default function TutorialModal({ isOpen, onClose }: TutorialModalProps) {
  const { language, translations } = useLanguage()
  const t = translations[language].tutorialModal

  const currentFeatures: Feature[] = [
    {
      title: t.welcome.title,
      description: t.welcome.description,
      color: 'text-purple-500',
      image: '/images/logo2.png',
    },
    {
      title: t.trickOrTreat.title,
      description: t.trickOrTreat.description,
      icon: FaThumbsUp,
      color: 'text-red-500',
    },
    {
      title: t.captureGhostlyGlamour.title,
      description: t.captureGhostlyGlamour.description,
      color: 'text-green-500',
      image: '/images/camera-logo2.png',
    },
    {
      title: t.globalCovenChat.title,
      description: t.globalCovenChat.description,
      icon: FaGlobe,
      color: 'text-blue-500',
    },
    {
      title: t.candyCauldronLeaderboard.title,
      description: t.candyCauldronLeaderboard.description,
      icon: FaTrophy,
      color: 'text-yellow-500',
    },
    {
      title: t.spookyProfiles.title,
      description: t.spookyProfiles.description,
      icon: FaComments,
      color: 'text-yellow-500',
    },
  ]

  const futureFeatures: Feature[] = [
    {
      title: t.brewMagicalPotions.title,
      description: t.brewMagicalPotions.description,
      icon: FaFlask,
      color: 'text-teal-500',
    },
    {
      title: t.hauntedCandyStore.title,
      description: t.hauntedCandyStore.description,
      icon: FaCandyCane,
      color: 'text-pink-500',
    },
    {
      title: t.seanceChats.title,
      description: t.seanceChats.description,
      icon: FaComments,
      color: 'text-green-500',
    },
    {
      title: t.evolveInnerMonster.title,
      description: t.evolveInnerMonster.description,
      icon: FaLevelUpAlt,
      color: 'text-orange-500',
    },
  ]

  const allSteps: Step[] = [
    ...currentFeatures,
    { isSeparator: true, title: t.comingAttractions },
    ...futureFeatures,
    {
      title: t.sweetBeginnings.title,
      description: t.sweetBeginnings.description,
      icon: FaCandyCane,
      color: 'text-pink-500',
    },
  ]

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
              {t.title}
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
                    {t.comingAttractionsDescription}
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
                    {(currentFeature as Feature).image ? (
                      <Image
                        src={(currentFeature as Feature).image!}
                        alt={(currentFeature as Feature).title}
                        width={150}
                        height={150}
                        className="object-contain rounded-lg filter drop-shadow-[0_0_20px_rgba(255,165,0,0.5)]"
                      />
                    ) : (currentFeature as Feature).icon ? (
                      React.createElement((currentFeature as Feature).icon!, {
                        className: `text-5xl sm:text-7xl ${
                          (currentFeature as Feature).color
                        }`,
                      })
                    ) : null}
                  </motion.div>
                  <h3 className="text-xl sm:text-2xl font-bold text-orange-400 mb-2 sm:mb-4 text-center">
                    {(currentFeature as Feature).title}
                  </h3>
                  <p className="text-sm sm:text-base text-orange-200 text-balance text-center max-w-md">
                    {(currentFeature as Feature).description}
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
                {t.previous}
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
                {currentStep === allSteps.length - 1 ? t.finish : t.next}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
