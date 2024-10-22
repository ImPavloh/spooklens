/*
Componente antiguo (idea antigua)
Se necesita react-tinder-card (^1.6.4)
Se mantiene por si se necesita en el futuro.

'use client'

import { useCallback, useState, memo, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import TinderCard from 'react-tinder-card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { FaSkull, FaCamera, FaGhost, FaHeart, FaTimes } from 'react-icons/fa'
import { GiBat, GiSpiderWeb, GiPumpkin, GiCandleSkull } from 'react-icons/gi'
import { useProfiles } from '@/hooks/useProfiles'
import { useSwipe } from '@/hooks/useSwipe'
import { useAuth } from '@/hooks/useAuth'
import confetti from 'canvas-confetti'

interface Profile {
  id: string
  imageUrl?: string
  name: string
  bio?: string
  age?: number
  interests?: string[]
  lastPhotoTimestamp?: string
  title?: string
  description?: string
}

export default function Component() {
  const { profiles, loading, error, fetchMoreProfiles } = useProfiles()
  const { handleSwipe, lastDirection } = useSwipe()
  const [currentIndex, setCurrentIndex] = useState(0)
  const router = useRouter()
  const { user } = useAuth()
  const [showConfetti, setShowConfetti] = useState(false)

  const cardVariants = useMemo(
    () => ({
      enter: { scale: 0.9, opacity: 0, y: 50 },
      center: { scale: 1, opacity: 1, y: 0 },
      exit: (direction: string) => ({
        x: direction === 'left' ? -300 : direction === 'right' ? 300 : 0,
        y: direction === 'up' ? -300 : 0,
        opacity: 0,
        transition: { duration: 0.3 },
      }),
    }),
    [],
  )

  const handleSwipeInternal = useCallback(
    async (direction: string, profile: Profile) => {
      try {
        await handleSwipe(direction, profile)
        setCurrentIndex((prevIndex) => prevIndex + 1)

        if (direction === 'right') {
          setShowConfetti(true)
          setTimeout(() => setShowConfetti(false), 3000)
        }

        if (profiles.length - currentIndex <= 3) {
          await fetchMoreProfiles()
        }
      } catch (err) {
        console.error('Error handling swipe:', err)
      }
    },
    [handleSwipe, profiles.length, currentIndex, fetchMoreProfiles],
  )

  const renderProfile = useCallback(
    (profile: Profile) => (
      <TinderCard
        className="absolute w-full h-full"
        key={profile.id}
        onSwipe={(dir) => handleSwipeInternal(dir, profile)}
        preventSwipe={['up', 'down']}
      >
        <motion.div
          variants={cardVariants}
          initial="enter"
          animate="center"
          exit="exit"
          custom={lastDirection}
        >
          <Card className="w-full h-full transform hover:scale-105 overflow-hidden shadow-lg shadow-purple-700/30 transition-all duration-300">
            <CardContent className="flex flex-col items-center justify-between p-6 h-full relative">
              <Image
                src={
                  profile.imageUrl || '/placeholder.svg?height=600&width=400'
                }
                alt={profile.name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
              <div className="z-20 text-orange-200 self-start w-full">
                <h2 className="text-3xl font-bold font-halloween mb-2">
                  {profile.name}, {profile.age || '?'}
                </h2>
                <p className="text-sm opacity-80 mb-4">
                  {profile.bio || 'A spooky mystery...'}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 mb-4 z-20">
                {profile.interests?.map((interest) => (
                  <Badge
                    key={interest}
                    variant="secondary"
                    className="bg-purple-700 text-white animate-float"
                  >
                    {interest}
                  </Badge>
                )) || <p className="text-orange-200">No interests listed.</p>}
              </div>
              <div className="z-20 text-center mb-4">
                <h3 className="text-xl font-bold text-orange-300">
                  {profile.title || 'Untitled Spooky Creation'}
                </h3>
                <p className="text-sm text-orange-200 mt-2">
                  {profile.description || 'No description available'}
                </p>
              </div>
              <div className="flex justify-between w-full z-20">
                <Button
                  size="sm"
                  onClick={() => handleSwipeInternal('left', profile)}
                  className="text-orange-300 bg-purple-800/50 hover:bg-purple-700 transition-all duration-300"
                  aria-label="Skip profile"
                >
                  <FaTimes className="mr-2 h-5 w-5" />
                  Skip
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleSwipeInternal('right', profile)}
                  className="text-orange-300 bg-purple-800/50 hover:bg-purple-700 transition-all duration-300"
                  aria-label="Like profile"
                >
                  <FaHeart className="mr-2 h-5 w-5" />
                  Trick or Treat
                </Button>
              </div>
              {profile.lastPhotoTimestamp && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="absolute bottom-2 right-2 bg-black/50 rounded-full p-2 z-30">
                        <FaCamera className="h-4 w-4 text-white" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Last photo taken:{' '}
                        {new Date(profile.lastPhotoTimestamp).toLocaleString()}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </TinderCard>
    ),
    [cardVariants, handleSwipeInternal, lastDirection],
  )

  const memoizedProfiles = useMemo(
    () => profiles.slice(currentIndex),
    [profiles, currentIndex],
  )

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-8 w-full h-full bg-gradient-to-b from-purple-900 to-black p-6 rounded-xl">
        <Skeleton className="w-full max-w-sm h-96 rounded-xl bg-purple-700/50" />
        <Skeleton className="w-3/4 h-8 bg-purple-700/50" />
        <Skeleton className="w-1/2 h-6 bg-purple-700/50" />
        <div className="flex gap-4">
          <Skeleton className="w-24 h-10 bg-purple-700/50" />
          <Skeleton className="w-24 h-10 bg-purple-700/50" />
        </div>
      </div>
    )
  }

  const hasProfiles = profiles.length > currentIndex

  return (
    <Card className="h-full w-full max-w-lg flex flex-col bg-gradient-to-b from-purple-900 to-black">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-orange-300 flex items-center justify-center font-halloween">
          <GiPumpkin
            className="mr-2 h-8 w-8 text-orange-500"
            aria-hidden="true"
          />
          Spooky Swipe
          <GiCandleSkull
            className="ml-2 h-8 w-8 text-orange-500"
            aria-hidden="true"
          />
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[calc(100%-4rem)] overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <GiSpiderWeb className="absolute top-0 left-0 text-purple-500/20 h-24 w-24" />
          <GiSpiderWeb className="absolute top-0 right-0 text-purple-500/20 h-24 w-24 transform scale-x-[-1]" />
        </div>
        <div className="relative flex flex-col items-center w-full h-full space-y-8">
          {!hasProfiles && (
            <div className="text-center text-purple-300 mt-6">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Image
                  src="/images/sad-logo.png"
                  alt="SpookLens"
                  className="mx-auto mb-4 filter drop-shadow-[0_0_20px_rgba(255,255,255,0.7)]"
                  width={160}
                  height={160}
                />
              </motion.div>
              <p className="text-2xl font-halloween">
                No more spooky profiles to haunt!
              </p>
              <p className="text-lg mt-2 text-orange-300">
                Check back later for more ghostly encounters...
              </p>
            </div>
          )}
          {error && (
            <Alert variant="destructive" className="bg-red-900 border-red-600">
              <AlertDescription className="text-white">
                {error ||
                  'An error occurred while loading profiles. Please try again.'}
              </AlertDescription>
            </Alert>
          )}
          <div className="relative w-full h-full max-w-sm">
            <AnimatePresence>
              {memoizedProfiles.map(renderProfile)}
            </AnimatePresence>
          </div>
        </div>
      </CardContent>
      {showConfetti && <Confetti />}
    </Card>
  )
}

const Confetti = memo(() => {
  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f97316', '#7c3aed', '#fbbf24'],
    })
  }, [])

  return null
})

Confetti.displayName = 'Confetti'
*/
