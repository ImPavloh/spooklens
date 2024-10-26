'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Skeleton } from '@/components/ui/skeleton'
import { IoChevronBackOutline, IoChevronForwardOutline } from 'react-icons/io5'

interface Slide {
  image: string
  alt: string
}

const slides: Slide[] = [
  {
    image: '/images/screenshots/s1.jpg',
    alt: 'SpookLens Finalist Project Hackathon 2024',
  },
  { image: '/images/screenshots/s2.jpg', alt: 'SpookLens Uploader' },
  { image: '/images/screenshots/s3.jpg', alt: 'SpookLens Hub' },
  { image: '/images/screenshots/s4.jpg', alt: 'SpookLens Trick or Treat' },
  { image: '/images/screenshots/s5.jpg', alt: 'SpookLens Leaderboard' },
  { image: '/images/screenshots/s6.jpg', alt: 'SpookLens Profiles' },
  { image: '/images/screenshots/s7.jpg', alt: 'SpookLens Store' },
]

export default function HauntedCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [imagesLoaded, setImagesLoaded] = useState<boolean[]>(
    new Array(slides.length).fill(false),
  )

  useEffect(() => {
    const timeForSlide = currentSlide === 0 ? 8000 : 5000
    const timer = setTimeout(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length)
    }, timeForSlide)

    return () => clearTimeout(timer)
  }, [currentSlide])

  const handleImageLoad = (index: number) => {
    setImagesLoaded((prev) => {
      const newState = [...prev]
      newState[index] = true
      return newState
    })
  }

  const navigate = (direction: 'prev' | 'next') => {
    setCurrentSlide((prev) => {
      if (direction === 'prev') {
        return (prev - 1 + slides.length) % slides.length
      } else {
        return (prev + 1) % slides.length
      }
    })
  }

  return (
    <div className="relative w-full max-w-3xl mx-auto aspect-video overflow-hidden rounded-lg shadow-2xl">
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
              draggable={false}
              quality={85}
              priority
              fill
              onLoad={() => handleImageLoad(index)}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      <button
        onClick={() => navigate('prev')}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/75 transition-colors"
        aria-label="Previous slide"
      >
        <IoChevronBackOutline className="w-6 h-6" />
      </button>

      <button
        onClick={() => navigate('next')}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/75 transition-colors"
        aria-label="Next slide"
      >
        <IoChevronForwardOutline className="w-6 h-6" />
      </button>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-4 h-4 rounded-full transition-colors duration-300 ${
              index === currentSlide
                ? 'bg-orange-500/80'
                : 'bg-gray-400/80 hover:bg-orange-300/80'
            }`}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
