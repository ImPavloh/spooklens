'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  FiCamera,
  FiMessageSquare,
  FiMusic,
  FiShoppingBag,
} from 'react-icons/fi'
import { FaTrophy, FaGithub, FaTwitter, FaCloudversify } from 'react-icons/fa'

import ScrollIndicator from '@/components/extras/ScrollIndicator'
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
    className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-orange-500/20 hover:border-orange-500/50 transition-all duration-300 group"
  >
    <span className="flex items-center justify-center text-4xl text-orange-500 mb-4 group-hover:scale-110 transition-transform duration-300">
      <Icon aria-hidden="true" />
    </span>
    <h2 className="text-xl font-bold text-orange-400 mb-2">{title}</h2>
    <p className="text-orange-200 text-sm">{description}</p>
  </motion.div>
)

function HauntedCarousel() {
  const slides = [
    {
      image: '/images/screenshots/s1.jpg',
      alt: 'SpookLens Finalist Project Hackathon 2024',
    },
    {
      image: '/images/screenshots/s2.jpg',
      alt: 'SpookLens Uploader',
    },
    {
      image: '/images/screenshots/s3.jpg',
      alt: 'SpookLens Hub',
    },
    {
      image: '/images/screenshots/s4.jpg',
      alt: 'SpookLens Trick or Treat',
    },
    {
      image: '/images/screenshots/s5.jpg',
      alt: 'SpookLens Leaderboard',
    },
    {
      image: '/images/screenshots/s6.jpg',
      alt: 'SpookLens Profiles',
    },
    {
      image: '/images/screenshots/s7.jpg',
      alt: 'SpookLens Store',
    },
  ]
  const [currentSlide, setCurrentSlide] = useState(0)
  const [imagesLoaded, setImagesLoaded] = useState<boolean[]>(
    new Array(slides.length).fill(false),
  )

  useEffect(() => {
    const timeForFirstSlide = currentSlide === 0 ? 8000 : 5000 // para destacar la primera imagen (finalista de la hackathon)
    const timer = setTimeout(
      () => setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length),
      timeForFirstSlide,
    )

    return () => clearTimeout(timer)
  }, [currentSlide, slides.length])

  const handleImageLoad = (index: number) => {
    setImagesLoaded((prev) => {
      const newState = [...prev]
      newState[index] = true
      return newState
    })
  }


  return (
    <div className="relative w-full max-w-4xl mx-auto aspect-video overflow-hidden rounded-lg shadow-2xl">
      <AnimatePresence initial={false}>
        {slides.map((slide, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: currentSlide === index ? 1 : 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            {!imagesLoaded[index] && (
              <Skeleton className="w-full h-full bg-gray-700 animate-pulse" />
            )}
            <Image
              src={slide.image}
              alt={slide.alt}
              className={`object-cover transition-opacity duration-300 ${
                imagesLoaded[index] ? 'opacity-100' : 'opacity-0'
              }`}
              draggable="false"
              quality={85}
              priority
              fill
              onLoad={() => handleImageLoad(index)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-colors duration-300 ${
              index === currentSlide
                ? 'bg-orange-500'
                : 'bg-gray-400 hover:bg-orange-300'
            }`}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

export default function Main() {
  const [isTutorialOpen, setIsTutorialOpen] = useState(false)
  const [disableBackgroundImage, setDisableBackgroundImage] = useState(false)

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

      <div className="container mx-auto px-4 pt-28">
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
            className="text-6xl md:text-7xl font-extrabold tracking-wider py-4 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-purple-600 mb-2 relative inline-block drop-shadow-[0_5px_3px_rgba(0,0,0,0.4)]"
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
              className="absolute -top-4 -right-16 text-5xl"
            >
              <Image
                src="/images/logo2.png"
                alt="SpookLens Logo"
                draggable="false"
                width={80}
                height={80}
                priority
              />
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-xl md:text-2xl text-orange-300 mb-6 drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]"
          >
            Unleash your inner ghoul in this bewitching Halloween social media
            app!
          </motion.p>

          <Button
            asChild
            className="bg-gradient-to-r from-orange-500 to-purple-600 text-white hover:from-orange-600 hover:to-purple-700 text-lg md:text-xl py-2 md:py-6 px-6 md:px-8 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            <Link href="/home">Step into the Shadows</Link>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-4"
        >
          <HauntedCarousel />
        </motion.div>

        <ScrollIndicator />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <FeatureCard
            icon={FiCamera}
            title="Spooktacular Snapshots"
            description="Share your most haunting looks and eerie moments. Earn candy for the best costume!"
            delay={0.2}
          />
          <FeatureCard
            icon={FiMessageSquare}
            title="Phantom Chat"
            description="Connect with fellow spirits in our global chat or send spine-chilling private messages."
            delay={0.4}
          />
          <FeatureCard
            icon={FaTrophy}
            title="Candy Leaderboard"
            description="Climb the ranks with your bone-chilling content and become the Halloween legend!"
            delay={0.6}
          />
          <FeatureCard
            icon={FiMusic}
            title="Haunted Jukebox"
            description="Set the perfect eerie atmosphere with our curated playlist of spooky tunes."
            delay={0.8}
          />
          <FeatureCard
            icon={FiShoppingBag}
            title="Cursed Candy Store"
            description="Trade your hard-earned candy for exclusive items and supernatural surprises."
            delay={1.0}
          />
          <FeatureCard
            icon={FaCloudversify}
            title="Cloudinary Sorcery"
            description="Enhance your creepy captures with AI-powered image editing, courtesy of Cloudinary."
            delay={1.2}
          />
        </div>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="text-center bg-gray-800/30 backdrop-blur-sm p-8 rounded-lg shadow-lg border border-purple-500/20 mb-16"
        >
          <h2 className="text-3xl font-halloween text-purple-400 mb-4">
            Powered by Cloudinary
          </h2>
          <Image
            src="/images/cloudinary-logo.png"
            alt="Cloudinary Logo"
            className="mx-auto rounded-lg shadow-sm mb-6"
            draggable="false"
            width={200}
            height={50}
            priority
          />
          <p className="text-lg text-orange-300 mb-8">
            Elevate your Halloween persona with AI-powered image editing and
            seamless media management.
          </p>
          <Button
            asChild
            className="bg-gradient-to-r from-orange-500 to-purple-600 text-white hover:from-orange-600 hover:to-purple-700 text-lg py-2 px-6 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            <Link
              href="https://cloudinary.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Uncover Cloudinary&apos;s Magic
            </Link>
          </Button>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="text-center text-orange-300 mt-16 pt-6 border-t border-orange-500/20"
        >
          <p className="mb-4">
            Made by{' '}
            <a
              href="https://www.x.com/impavloh"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-400 hover:underline"
            >
              Pavloh
            </a>{' '}
            - Finalist project in the{' '}
            <a
              href="https://cloudinary.com/blog/cloudinary-cloudcreate-spooky-ai-hackathon"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-400 hover:underline"
            >
              MiduDev x Cloudinary Hackathon 2024: Spooky AI Creations
            </a>
          </p>
          <div className="flex justify-center space-x-4 mb-6">
            <a
              href="https://x.com/impavloh"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-400 hover:text-orange-500 transition-colors duration-300"
              aria-label="Follow Pavloh on Twitter"
            >
              <FaTwitter className="w-6 h-6" />
            </a>
            <a
              href="https://github.com/impavloh"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-400 hover:text-orange-500 transition-colors duration-300"
              aria-label="View Pavloh's GitHub profile"
            >
              <FaGithub className="w-6 h-6" />
            </a>
          </div>
        </motion.section>
      </div>
    </main>
  )
}
