'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'

import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FaGhost, FaSkull, FaCandyCane } from 'react-icons/fa'
import { LuCandy } from 'react-icons/lu'

import { auth, db } from '@/lib/firebase'
import { doc, updateDoc, increment, getDoc } from 'firebase/firestore'

import { useAudio } from '@/hooks/useAudio'
import { useLanguage } from '@/utils/LanguageContext'

interface TrickOrTreatModalProps {
  isOpen: boolean
  onClose: () => void
  onOpenUploadModal: () => void
}

export default function TrickOrTreatModal({
  isOpen,
  onClose,
  onOpenUploadModal,
}: TrickOrTreatModalProps) {
  const { language, translations } = useLanguage()
  const t = translations[language].trickOrTreatModal

  const [result, setResult] = useState<'trick' | 'treat' | null>(null)
  const [cooldown, setCooldown] = useState(0)
  const [isSpinning, setIsSpinning] = useState(false)
  const [showWheel, setShowWheel] = useState(true)
  const [candiesWon, setCandiesWon] = useState(0)
  const [trickTimer, setTrickTimer] = useState<NodeJS.Timeout | null>(null)
  const [showTrickWarning, setShowTrickWarning] = useState(false)
  const [isUserRegistered, setIsUserRegistered] = useState(false)

  const playSpinSound = useAudio('/sounds/wheel-spin.mp3')
  const playTreatSound = useAudio('/sounds/treat.mp3')
  const playTrickSound = useAudio('/sounds/trick.mp3')

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [cooldown])

  useEffect(() => {
    const checkUserRegistration = async () => {
      const user = auth.currentUser
      if (user) {
        const userRef = doc(db, 'users', user.uid)
        const userDoc = await getDoc(userRef)
        setIsUserRegistered(userDoc.exists())
      } else {
        setIsUserRegistered(false)
      }
    }
    checkUserRegistration()
  }, [])

  const updateTotalSpins = async () => {
    const user = auth.currentUser
    if (user) {
      const userRef = doc(db, 'users', user.uid)
      await updateDoc(userRef, {
        totalSpins: increment(1),
      })
    }
  }

  const handleTrickOrTreat = useCallback(async () => {
    if (cooldown > 0 || isSpinning || !isUserRegistered) return
    setIsSpinning(true)
    setShowWheel(true)
    playSpinSound()

    await updateTotalSpins()

    setTimeout(() => {
      const randomResult = Math.random() < 0.9 ? 'trick' : 'treat'
      setResult(randomResult)
      setIsSpinning(false)
      setCooldown(30)
      setShowWheel(false)

      if (randomResult === 'treat') {
        const candies = Math.floor(Math.random() * 5) + 1
        setCandiesWon(candies)
        playTreatSound()
      } else {
        playTrickSound()
        setShowTrickWarning(true)
        const timer = setTimeout(() => {
          handleTrickPenalty()
        }, 10000)
        setTrickTimer(timer)
      }
    }, 2000)
  }, [
    cooldown,
    isSpinning,
    playSpinSound,
    playTreatSound,
    playTrickSound,
    isUserRegistered,
  ])

  const handleTrickPenalty = async () => {
    const user = auth.currentUser
    if (user) {
      const userRef = doc(db, 'users', user.uid)
      const userDoc = await getDoc(userRef)
      if (userDoc.exists()) {
        const currentCandies = userDoc.data().totalCandies || 0
        if (currentCandies > 1) {
          await updateDoc(userRef, {
            totalCandies: increment(-1),
          })
        }
      }
    }
    setShowTrickWarning(false)
    setResult(null)
    setShowWheel(true)
  }

  const updateUserCandies = async (candies: number) => {
    const user = auth.currentUser
    if (user) {
      const userRef = doc(db, 'users', user.uid)
      await updateDoc(userRef, {
        totalCandies: increment(candies),
      })
    }
  }

  const handleClose = useCallback(() => {
    if (trickTimer) {
      clearTimeout(trickTimer)
    }
    setResult(null)
    setShowWheel(true)
    setCandiesWon(0)
    setShowTrickWarning(false)
    onClose()
  }, [onClose, trickTimer])

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-gradient-to-br from-purple-900 to-gray-900 text-white p-0 border-2 border-orange-500 shadow-xl shadow-orange-500/20 max-w-[95vw] sm:max-w-md w-full">
        <DialogTitle className="sr-only">{t.title}</DialogTitle>
        <AnimatePresence mode="wait">
          <motion.div
            key={result === null ? 'initial' : 'result'}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="p-4 sm:p-6"
          >
            <ModalContent
              result={result}
              isSpinning={isSpinning}
              cooldown={cooldown}
              handleTrickOrTreat={handleTrickOrTreat}
              onOpenUploadModal={onOpenUploadModal}
              onClose={handleClose}
              showWheel={showWheel}
              candiesWon={candiesWon}
              updateUserCandies={updateUserCandies}
              showTrickWarning={showTrickWarning}
              isUserRegistered={isUserRegistered}
              t={t}
            />
            <CooldownBar cooldown={cooldown} />
            <SpinCount t={t} />
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}

interface ModalContentProps {
  result: 'trick' | 'treat' | null
  isSpinning: boolean
  cooldown: number
  handleTrickOrTreat: () => Promise<void>
  onOpenUploadModal: () => void
  onClose: () => void
  showWheel: boolean
  candiesWon: number
  updateUserCandies: (candies: number) => Promise<void>
  showTrickWarning: boolean
  isUserRegistered: boolean
  t: any
}

const ModalContent = React.memo(
  ({
    result,
    isSpinning,
    cooldown,
    handleTrickOrTreat,
    onOpenUploadModal,
    onClose,
    showWheel,
    candiesWon,
    updateUserCandies,
    showTrickWarning,
    isUserRegistered,
    t,
  }: ModalContentProps) => (
    <div className="flex flex-col sm:flex-row items-center justify-center sm:space-x-4 space-y-4 sm:space-y-0">
      <div className="text-center space-y-4 sm:space-y-6 flex-1 order-2 sm:order-1">
        {result === null ? (
          <InitialContent
            cooldown={cooldown}
            isSpinning={isSpinning}
            handleTrickOrTreat={handleTrickOrTreat}
            isUserRegistered={isUserRegistered}
            t={t}
          />
        ) : (
          <ResultContent
            result={result}
            onOpenUploadModal={onOpenUploadModal}
            onClose={onClose}
            candiesWon={candiesWon}
            updateUserCandies={updateUserCandies}
            showTrickWarning={showTrickWarning}
            t={t}
          />
        )}
      </div>
      {showWheel && <SpinningWheel isSpinning={isSpinning} t={t} />}
    </div>
  ),
)

ModalContent.displayName = 'ModalContent'

interface InitialContentProps {
  cooldown: number
  isSpinning: boolean
  handleTrickOrTreat: () => Promise<void>
  isUserRegistered: boolean
  t: any
}

const InitialContent = React.memo(
  ({
    cooldown,
    isSpinning,
    handleTrickOrTreat,
    isUserRegistered,
    t,
  }: InitialContentProps) => (
    <>
      <motion.p
        className="text-lg sm:text-xl text-gray-300 mb-2 sm:mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {t.dareToTempt}
      </motion.p>
      <SpinButton
        cooldown={cooldown}
        isSpinning={isSpinning}
        onClick={handleTrickOrTreat}
        isUserRegistered={isUserRegistered}
        t={t}
      />
    </>
  ),
)

InitialContent.displayName = 'InitialContent'

interface SpinButtonProps {
  cooldown: number
  isSpinning: boolean
  onClick: () => Promise<void>
  isUserRegistered: boolean
  t: any
}

const SpinButton = React.memo(
  ({ cooldown, isSpinning, onClick, isUserRegistered, t }: SpinButtonProps) => (
    <Button
      onClick={onClick}
      disabled={cooldown > 0 || isSpinning || !isUserRegistered}
      className="group relative overflow-hidden rounded-full bg-gradient-to-r from-orange-500 via-red-500 to-purple-600 p-[2px] focus:outline-none hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
      aria-label={
        !isUserRegistered
          ? t.registerToSpin
          : cooldown > 0
          ? t.waitSeconds.replace('{seconds}', cooldown.toString())
          : t.spinTheWheel
      }
    >
      <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2C9FB_0%,#A5B4FC_50%,#818CF8_100%)]" />
      <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-gray-900 px-4 sm:px-8 py-2 sm:py-3 text-base sm:text-lg font-medium text-orange-300 backdrop-blur-3xl transition-colors duration-300 group-hover:bg-gray-800">
        <AnimatePresence mode="wait">
          <motion.span
            key={
              !isUserRegistered
                ? 'register'
                : cooldown > 0
                ? 'cooldown'
                : 'spin'
            }
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full sm:w-[150px] text-center inline-block"
          >
            {!isUserRegistered
              ? t.registerToSpin
              : cooldown > 0
              ? t.waitSeconds.replace('{seconds}', cooldown.toString())
              : t.spinTheWheel}
          </motion.span>
        </AnimatePresence>
      </span>
    </Button>
  ),
)

SpinButton.displayName = 'SpinButton'

interface ResultContentProps {
  result: 'trick' | 'treat'
  onOpenUploadModal: () => void
  onClose: () => void
  candiesWon: number
  updateUserCandies: (candies: number) => Promise<void>
  showTrickWarning: boolean
  t: any
}

const ResultContent = React.memo(
  ({
    result,
    onOpenUploadModal,
    onClose,
    candiesWon,
    updateUserCandies,
    showTrickWarning,
    t,
  }: ResultContentProps) => (
    <motion.div
      className="text-center space-y-4 sm:space-y-6"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      {result === 'treat' ? (
        <TreatResult
          onClose={onClose}
          candiesWon={candiesWon}
          updateUserCandies={updateUserCandies}
          t={t}
        />
      ) : (
        <TrickResult
          onOpenUploadModal={onOpenUploadModal}
          onClose={onClose}
          showTrickWarning={showTrickWarning}
          t={t}
        />
      )}
    </motion.div>
  ),
)

ResultContent.displayName = 'ResultContent'

interface TreatResultProps {
  onClose: () => void
  candiesWon: number
  updateUserCandies: (candies: number) => Promise<void>
  t: any
}

const TreatResult = React.memo(
  ({ onClose, candiesWon, updateUserCandies, t }: TreatResultProps) => (
    <div className="text-green-400 space-y-2 sm:space-y-4">
      <motion.div
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 0.5 }}
      >
        <LuCandy
          className="inline-block text-4xl sm:text-6xl mb-2"
          aria-hidden="true"
        />
      </motion.div>
      <motion.p
        className="text-xl sm:text-2xl font-bold"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {t.youGotTreat}
      </motion.p>
      <motion.p
        className="mt-2 text-base  sm:text-lg"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {t.luckyYou.replace('{candies}', candiesWon.toString())}
      </motion.p>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Button
          onClick={async () => {
            await updateUserCandies(candiesWon)
            onClose()
          }}
          className="mt-2 sm:mt-4 bg-green-600 hover:bg-green-700 text-white py-2 px-4 sm:px-6 rounded-full text-base sm:text-lg transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
        >
          <FaCandyCane className="inline-block mr-2" aria-hidden="true" />
          {t.claimYourTreat}
        </Button>
      </motion.div>
    </div>
  ),
)

TreatResult.displayName = 'TreatResult'

interface TrickResultProps {
  onOpenUploadModal: () => void
  onClose: () => void
  showTrickWarning: boolean
  t: any
}

const TrickResult = React.memo(
  ({ onOpenUploadModal, onClose, showTrickWarning, t }: TrickResultProps) => (
    <div className="text-red-400 space-y-2 sm:space-y-4">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: 'spring',
          stiffness: 260,
          damping: 20,
        }}
      >
        <FaSkull
          className="inline-block text-4xl sm:text-6xl mb-2"
          aria-hidden="true"
        />
      </motion.div>
      <motion.p
        className="text-xl sm:text-2xl font-bold"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {t.youHaveBeenTricked}
      </motion.p>
      <motion.p
        className="mt-2 text-base sm:text-lg"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {t.spiritsNotInFavor}
      </motion.p>
      {showTrickWarning && (
        <motion.p
          className="mt-2 text-xs sm:text-sm text-yellow-300"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {t.quickClickWarning}
        </motion.p>
      )}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Button
          onClick={() => {
            onClose()
            onOpenUploadModal()
          }}
          className="mt-2 sm:mt-4 bg-red-600 hover:bg-red-700 text-white py-2 px-4 sm:px-6 rounded-full text-base sm:text-lg transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
        >
          <FaGhost className="inline-block mr-2" aria-hidden="true" />
          {t.spookOnePhoto}
        </Button>
      </motion.div>
    </div>
  ),
)

TrickResult.displayName = 'TrickResult'

const SpinningWheel = React.memo(
  ({ isSpinning, t }: { isSpinning: boolean; t: any }) => (
    <motion.div
      className="w-24 h-24 sm:w-32 sm:h-32 relative order-1 sm:order-2"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 0.3,
      }}
    >
      <Image
        src={isSpinning ? '/images/ruleta.gif' : '/images/ruleta.png'}
        alt={isSpinning ? t.spinningWheelAlt : t.wheelAlt}
        layout="fill"
        draggable={false}
        quality={90}
        priority
      />
    </motion.div>
  ),
)

SpinningWheel.displayName = 'SpinningWheel'

const CooldownBar = React.memo(({ cooldown }: { cooldown: number }) =>
  cooldown > 0 ? (
    <motion.div
      initial={{ width: '100%' }}
      animate={{ width: '0%' }}
      transition={{ duration: 30, ease: 'linear' }}
      className="h-1 sm:h-2 bg-orange-500 mt-4 sm:mt-6 rounded-full"
      role="progressbar"
      aria-valuenow={cooldown}
      aria-valuemin={0}
      aria-valuemax={30}
    />
  ) : null,
)

CooldownBar.displayName = 'CooldownBar'

const SpinCount = React.memo(({ t }: { t: any }) => {
  const [totalSpins, setTotalSpins] = useState(0)

  useEffect(() => {
    const fetchTotalSpins = async () => {
      const user = auth.currentUser
      if (user) {
        const userRef = doc(db, 'users', user.uid)
        const userDoc = await getDoc(userRef)
        if (userDoc.exists()) {
          setTotalSpins(userDoc.data().totalSpins || 0)
        }
      }
    }

    fetchTotalSpins()
  }, [])

  return (
    <div className="mt-2 sm:mt-4 text-xs sm:text-sm text-gray-400">
      {t.totalSpins.replace('{count}', totalSpins.toString())}
    </div>
  )
})

SpinCount.displayName = 'SpinCount'
