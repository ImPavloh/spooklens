'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'

import { motion, AnimatePresence } from 'framer-motion'
import {
  FiPlay,
  FiPause,
  FiSkipForward,
  FiSkipBack,
  FiVolume2,
  FiRepeat,
  FiShuffle,
  FiList,
} from 'react-icons/fi'
import { FaGhost, FaCandyCane, FaSpider, FaSkull } from 'react-icons/fa'
import { GiCauldron, GiPumpkin, GiBat } from 'react-icons/gi'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'

import { useToast } from '@/hooks/useToast'
import { useLanguage } from '@/utils/LanguageContext'

const playlist = [
  {
    title: 'Spooky Ride',
    artist: 'Dmitrii',
    audioUrl:
      'https://res.cloudinary.com/dpthld5d9/video/upload/v1729360753/halloween-248129_rbkp60.mp3',
    imageUrl: '/images/covers/cover1.jpg',
    credit: {
      artist: 'Dmitrii',
      artistUrl:
        'https://pixabay.com/users/hot_dope-27442149/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=248129',
      source: 'Pixabay',
      sourceUrl:
        'https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=248129',
    },
  },
  {
    title: 'Dark Ambient',
    artist: 'Mikhail Smusev',
    audioUrl:
      'https://res.cloudinary.com/dpthld5d9/video/upload/v1729360754/halloween-trap-252164_xod3uq.mp3',
    imageUrl: '/images/covers/cover2.jpg',
    credit: {
      artist: 'Mikhail Smusev',
      artistUrl:
        'https://pixabay.com/users/sigmamusicart-36860929/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=252164',
      source: 'Pixabay',
      sourceUrl:
        'https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=252164',
    },
  },
  {
    title: 'Funny Halloween Spooky Horror',
    artist: 'FASSounds',
    audioUrl:
      'https://res.cloudinary.com/dpthld5d9/video/upload/v1729360753/funny-halloween-spooky-horror-background-music-242101_fxdudr.mp3',
    imageUrl: '/images/covers/cover3.jpg',
    credit: {
      artist: 'FASSounds',
      artistUrl:
        'https://pixabay.com/users/fassounds-3433550/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=242101',
      source: 'Pixabay',
      sourceUrl:
        'https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=242101',
    },
  },
  {
    title: 'Scary Pumpkin Spooky Halloween Trap',
    artist: 'FASSounds',
    audioUrl:
      'https://res.cloudinary.com/dpthld5d9/video/upload/v1729360753/scary-pumpkin-spooky-halloween-trap-beat-242102_w2iefq.mp3',
    imageUrl: '/images/covers/cover4.jpg',
    credit: {
      artist: 'FASSounds',
      artistUrl:
        'https://pixabay.com/users/fassounds-3433550/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=242102',
      source: 'Pixabay',
      sourceUrl:
        'https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=242102',
    },
  },
  {
    title: 'Vampires Light Halloween Horror Music Loop',
    artist: 'Cyberwave Orchestra',
    audioUrl:
      'https://res.cloudinary.com/dpthld5d9/video/upload/v1729360753/vampires-light-halloween-horror-music-loop-244575_k51e6e.mp3',
    imageUrl: '/images/covers/cover5.jpg',
    credit: {
      artist: 'Cyberwave Orchestra',
      artistUrl:
        'https://pixabay.com/users/cyberwave-orchestra-23801316/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=244575',
      source: 'Pixabay',
      sourceUrl:
        'https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=244575',
    },
  },
  {
    title: 'Spooky Halloween Autumn',
    artist: 'SOULFULJAMTRACKS',
    audioUrl:
      'https://res.cloudinary.com/dpthld5d9/video/upload/v1729360754/spooky-halloween-autumn-250074_ee1nwf.mp3',
    imageUrl: '/images/covers/cover6.jpg',
    credit: {
      artist: 'SOULFULJAMTRACKS',
      artistUrl:
        'https://pixabay.com/users/soulfuljamtracks-46363515/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=250074',
      source: 'Pixabay',
      sourceUrl:
        'https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=250074',
    },
  },
  {
    title: 'Spooky Horror Piano',
    artist: 'Josef Surikov',
    audioUrl:
      'https://res.cloudinary.com/dpthld5d9/video/upload/v1729360753/spooky-horror-piano-251201_zkbnid.mp3',
    imageUrl: '/images/covers/cover7.jpg',
    credit: {
      artist: 'Josef Surikov',
      artistUrl:
        'https://pixabay.com/users/leberchmus-42823964/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=251201',
      source: 'Pixabay',
      sourceUrl:
        'https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=251201',
    },
  },
  {
    title: 'Dancing Halloween Ghosts',
    artist: 'SOULFULJAMTRACKS',
    audioUrl:
      'https://res.cloudinary.com/dpthld5d9/video/upload/v1729360753/dancing-halloween-ghosts-250747_kat8lq.mp3',
    imageUrl: '/images/covers/cover8.jpg',
    credit: {
      artist: 'SOULFULJAMTRACKS',
      artistUrl:
        'https://pixabay.com/users/soulfuljamtracks-46363515/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=250747',
      source: 'Pixabay',
      sourceUrl:
        'https://pixabay.com/music//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=250747',
    },
  },
]

interface FloatingIconProps {
  Icon: React.FC<{ size: number }>
  delay?: number
}

// usando memo la animación será unica y no se repetirá "cada vez que pase un segundo"
const FloatingIcon: React.FC<FloatingIconProps> = ({ Icon, delay = 0 }) => (
  <motion.div
    className="absolute text-orange-500/20"
    style={{
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
    }}
    animate={{
      y: [0, -20, 0],
      x: [0, 10, 0],
      rotate: [0, 360],
    }}
    transition={{
      duration: 5 + Math.random() * 5,
      repeat: Infinity,
      repeatType: 'reverse',
      delay,
    }}
  >
    <Icon size={20 + Math.random() * 30} />
  </motion.div>
)

FloatingIcon.displayName = 'FloatingIcon'

interface LocalSettings {
  disableMusicPlayerAnimations: boolean
  musicPlayerVolume: number
}

interface MusicPlayerProps {
  localSettings: LocalSettings
}

const MusicPlayerSkeleton = () => (
  <Card className="w-full h-full max-w-[400px] mx-auto bg-gradient-to-br from-[#1a1a1d] to-[#2c003e] border-orange-500 shadow-xl overflow-hidden shadow-orange-500/50 flex flex-col">
    <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 p-4">
      <Skeleton className="w-3/4 h-8 bg-orange-300/50" />
    </CardHeader>
    <CardContent className="flex-grow flex flex-col justify-between p-4">
      <Skeleton className="w-full aspect-square rounded-lg mb-4" />
      <div className="space-y-4">
        <Skeleton className="w-full h-4" />
        <Skeleton className="w-3/4 h-4" />
        <div className="flex justify-between">
          <Skeleton className="w-12 h-12 rounded-full" />
          <Skeleton className="w-12 h-12 rounded-full" />
          <Skeleton className="w-12 h-12 rounded-full" />
        </div>
        <Skeleton className="w-full h-4" />
      </div>
    </CardContent>
  </Card>
)

export default function MusicPlayer({ localSettings }: MusicPlayerProps) {
  const { language, translations } = useLanguage()
  const t = translations[language].musicPlayer

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrack, setCurrentTrack] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isRepeat, setIsRepeat] = useState(false)
  const [isShuffle, setIsShuffle] = useState(false)
  const [duration, setDuration] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const audioRef = useRef<HTMLAudioElement>(null)
  const { toast } = useToast()
  const [imageLoaded, setImageLoaded] = useState(false)
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false)
  const [currentVolume, setCurrentVolume] = useState(
    localSettings.musicPlayerVolume,
  )

  const handlePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev)
  }, [])

  const handleNext = useCallback(() => {
    setCurrentTrack((prev) => {
      if (isShuffle) {
        let nextTrack
        do {
          nextTrack = Math.floor(Math.random() * playlist.length)
        } while (nextTrack === prev && playlist.length > 1)
        return nextTrack
      }
      return (prev + 1) % playlist.length
    })
  }, [isShuffle])

  const handlePrevious = useCallback(() => {
    setCurrentTrack((prev) => {
      if (isShuffle) {
        let prevTrack
        do {
          prevTrack = Math.floor(Math.random() * playlist.length)
        } while (prevTrack === prev && playlist.length > 1)
        return prevTrack
      }
      return (prev - 1 + playlist.length) % playlist.length
    })
  }, [isShuffle])

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      const progress =
        (audioRef.current.currentTime / audioRef.current.duration) * 100
      setProgress(progress)
      setDuration(audioRef.current.duration)
    }
  }, [])

  const handleSliderChange = useCallback((value: number[]) => {
    if (audioRef.current) {
      const time = (value[0] / 100) * audioRef.current.duration
      audioRef.current.currentTime = time
      setProgress(value[0])
    }
  }, [])

  const handleVolumeChange = useCallback((value: number[]) => {
    const newVolume = value[0]
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100
    }
    setCurrentVolume(newVolume)
  }, [])

  const handleRepeat = useCallback(() => {
    setIsRepeat((prev) => !prev)
    toast({
      title: isRepeat ? t.toasts.repeatOff.title : t.toasts.repeatOn.title,
      description: isRepeat
        ? t.toasts.repeatOff.description
        : t.toasts.repeatOn.description,
    })
  }, [isRepeat, toast, t.toasts])

  const handleShuffle = useCallback(() => {
    setIsShuffle((prev) => !prev)
    toast({
      title: isShuffle ? t.toasts.shuffleOff.title : t.toasts.shuffleOn.title,
      description: isShuffle
        ? t.toasts.shuffleOff.description
        : t.toasts.shuffleOn.description,
    })
  }, [isShuffle, toast, t.toasts])

  const formatTime = useCallback((time: number | undefined) => {
    if (typeof time !== 'number' || isNaN(time)) {
      return '0:00'
    }
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
  }, [])

  const handlePlaylistItemClick = useCallback((index: number) => {
    setCurrentTrack(index)
    setIsPlaying(true)
    setIsPlaylistOpen(false)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    setImageLoaded(false)
  }, [currentTrack])

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch((error) => {
          console.error('Error playing audio:', error)
          setIsPlaying(false)
        })
      } else {
        audioRef.current.pause()
      }
    }
  }, [isPlaying, currentTrack])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = localSettings.musicPlayerVolume / 100
    }
    setCurrentVolume(localSettings.musicPlayerVolume)
  }, [localSettings.musicPlayerVolume])

  const renderPlaylistItem = useCallback(
    (track: (typeof playlist)[0], index: number) => (
      <motion.li
        key={index}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className={`p-3 rounded-lg transition-colors ${
          index === currentTrack
            ? 'bg-orange-500 text-white'
            : 'bg-orange-500/10 hover:bg-orange-500/20'
        }`}
      >
        <div
          className="flex items-center cursor-pointer"
          onClick={() => handlePlaylistItemClick(index)}
        >
          <div className="flex-shrink-0 w-12 h-12 mr-3">
            <Image
              src={track.imageUrl}
              alt={track.title}
              className="w-full h-full object-cover rounded"
              width={48}
              height={48}
            />
          </div>
          <div className="flex-grow">
            <h3 className="font-semibold text-lg">{track.title}</h3>
            <p className="text-sm text-orange-300">{track.artist}</p>
          </div>
          {index === currentTrack && (
            <Button
              size="icon"
              variant="ghost"
              className="ml-2"
              onClick={(e) => {
                e.stopPropagation()
                handlePlayPause()
              }}
            >
              {isPlaying ? (
                <FiPause className="h-5 w-5 text-white" />
              ) : (
                <FiPlay className="h-5 w-5 text-white" />
              )}
            </Button>
          )}
        </div>
      </motion.li>
    ),
    [currentTrack, handlePlaylistItemClick, isPlaying, handlePlayPause],
  )

  if (isLoading) {
    return <MusicPlayerSkeleton />
  }

  return (
    <Card className="w-full h-full max-w-[400px] mx-auto bg-gradient-to-br from-[#1a1a1d] to-[#2c003e] border-orange-500 shadow-xl overflow-hidden shadow-orange-500/50 flex flex-col [box-shadow:rgba(255,165,0,0.2)_5px_5px,rgba(255,165,0,0.15)_10px_10px,rgba(255,165,0,0.1)_15px_15px,rgba(255,165,0,0.05)_20px_20px,rgba(255,165,0,0.025)_25px_25px] relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black pointer-events-none" />
      <CardHeader className="bg-gradient-to-r from-orange-500 to-purple-600 p-4 relative z-10">
        <CardTitle className="text-2xl font-semibold text-white flex items-center justify-center font-halloween">
          {!localSettings.disableMusicPlayerAnimations ? (
            <>
              <motion.div
                animate={{ rotate: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <FaGhost className="mr-2 h-6 w-6" aria-hidden="true" />
              </motion.div>
              {t.title}
              <motion.div
                animate={{ rotate: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              >
                <GiCauldron className="ml-2 h-6 w-6" aria-hidden="true" />
              </motion.div>
            </>
          ) : (
            <>
              <FaGhost className="mr-2 h-6 w-6" aria-hidden="true" />
              {t.title}
              <GiCauldron className="ml-2 h-6 w-6" aria-hidden="true" />
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-between p-4 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTrack}
            initial={
              localSettings.disableMusicPlayerAnimations
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 20 }
            }
            animate={{ opacity: 1, y: 0 }}
            exit={
              localSettings.disableMusicPlayerAnimations
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: -20 }
            }
            transition={{
              duration: localSettings.disableMusicPlayerAnimations ? 0 : 0.3,
            }}
            className="mb-4 flex-shrink-0"
          >
            <div className="mb-4 text-white text-center">
              {playlist[currentTrack].title}
            </div>
            <div className="relative aspect-square rounded-lg overflow-hidden mx-auto w-2/3">
              {!imageLoaded && (
                <Skeleton className="absolute inset-0 w-full h-full" />
              )}
              <Image
                src={playlist[currentTrack].imageUrl}
                alt={playlist[currentTrack].title}
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                width={200}
                height={200}
                quality={80}
                onLoad={() => setImageLoaded(true)}
                draggable={false}
                priority
              />
              <motion.div
                className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center text-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-2xl font-bold mb-2 text-center px-2">
                  {playlist[currentTrack].title}
                </h2>
                <p className="text-lg">{playlist[currentTrack].artist}</p>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        <audio
          ref={audioRef}
          src={playlist[currentTrack].audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onEnded={isRepeat ? () => audioRef.current?.play() : handleNext}
        />

        <div className="flex-grow flex flex-col justify-end">
          <div className="flex justify-between text-xs text-orange-300 mb-1">
            <span>{formatTime(audioRef.current?.currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>

          <Slider
            value={[progress]}
            max={100}
            step={1}
            onValueChange={handleSliderChange}
            className="mb-4"
            aria-label={t.ariaLabels.trackProgress}
          />

          <div className="flex justify-center gap-4 mb-4 text-orange-300">
            <Button
              size="icon"
              onClick={handleShuffle}
              className={`text-orange-500 hover:text-orange-600 hover:bg-orange-200/10 transition-colors ${
                isShuffle ? 'bg-orange-500/20' : ''
              }`}
              aria-label={
                isShuffle ? t.ariaLabels.shuffleOn : t.ariaLabels.shuffleOff
              }
            >
              <FiShuffle className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              onClick={handlePrevious}
              className="bg-orange-500 hover:bg-orange-600 text-white transition-colors"
              aria-label={t.ariaLabels.previousTrack}
            >
              <FiSkipBack className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              onClick={handlePlayPause}
              className="bg-orange-500 hover:bg-orange-600 text-white transition-colors"
              aria-label={isPlaying ? t.ariaLabels.pause : t.ariaLabels.play}
            >
              {isPlaying ? (
                <FiPause className="h-4 w-4" />
              ) : (
                <FiPlay className="h-4 w-4" />
              )}
            </Button>
            <Dialog open={isPlaylistOpen} onOpenChange={setIsPlaylistOpen}>
              <DialogTrigger asChild>
                <Button
                  size="icon"
                  className="bg-orange-500 hover:bg-orange-600 text-white transition-colors"
                  aria-label={t.ariaLabels.openPlaylist}
                >
                  <FiList className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-[#1a1a1d] to-[#2c003e] border-orange-500 text-white">
                <DialogHeader>
                  <DialogTitle className="text-3xl font-halloween text-orange-500 text-center mb-4">
                    {t.playlistTitle}
                  </DialogTitle>
                  <DialogDescription className="flex justify-center">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    >
                      <FaGhost className="text-gray-300 text-2xl" />
                    </motion.div>
                  </DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-[60vh] pr-4">
                  <ul className="space-y-2">
                    {playlist.map(renderPlaylistItem)}
                  </ul>
                </ScrollArea>
              </DialogContent>
            </Dialog>
            <Button
              size="icon"
              onClick={handleNext}
              className="bg-orange-500 hover:bg-orange-600 text-white transition-colors"
              aria-label={t.ariaLabels.nextTrack}
            >
              <FiSkipForward className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              onClick={handleRepeat}
              className={`text-orange-500 hover:text-orange-600 hover:bg-orange-200/10 transition-colors ${
                isRepeat ? 'bg-orange-500/20' : ''
              }`}
              aria-label={
                isRepeat ? t.ariaLabels.repeatOn : t.ariaLabels.repeatOff
              }
            >
              <FiRepeat className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center mb-4">
            <FiVolume2
              className="h-4 w-4 text-orange-500 mr-2"
              aria-hidden="true"
            />
            <Slider
              value={[currentVolume]}
              max={100}
              step={1}
              onValueChange={handleVolumeChange}
              className="flex-grow"
              aria-label={t.ariaLabels.volume}
            />
          </div>

          <motion.div
            className="text-center text-orange-300 font-halloween"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <FaCandyCane
              className="inline-block  mr-2 text-pink-400"
              aria-hidden="true"
            />
            <span>
              {t.trackCount.replace('{count}', playlist.length.toString())}
            </span>
            <FaSkull
              className="inline-block ml-2 text-gray-400"
              aria-hidden="true"
            />
          </motion.div>
          <div className="text-xs text-orange-300 mt-4 text-center">
            <div className="group relative inline-block cursor-pointer">
              <span>
                <Link
                  href={playlist[currentTrack].credit.artistUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {playlist[currentTrack].credit.artist}
                </Link>{' '}
                {t.from}{' '}
                <Link
                  href={playlist[currentTrack].credit.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {playlist[currentTrack].credit.source}
                </Link>
              </span>
              <span className="absolute left-0 bottom-0 w-full h-px bg-orange-300 transform scale-x-0 transition-transform duration-300 ease-in-out group-hover:scale-x-100"></span>
            </div>
          </div>
        </div>
      </CardContent>
      {!localSettings.disableMusicPlayerAnimations && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <FloatingIcon Icon={FaGhost} delay={0} />
          <FloatingIcon Icon={GiPumpkin} delay={1} />
          <FloatingIcon Icon={FaSpider} delay={2} />
          <FloatingIcon Icon={GiBat} delay={3} />
          <FloatingIcon Icon={FaSkull} delay={4} />
        </div>
      )}
    </Card>
  )
}
