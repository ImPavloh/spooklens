'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { GiSpiderWeb, GiPumpkin, GiCandleSkull } from 'react-icons/gi'
import { FaDownload, FaLink, FaCamera, FaShare, FaTrash } from 'react-icons/fa'

import confetti from 'canvas-confetti'

import { useLanguage } from '@/utils/LanguageContext'

interface MyViewerProps {
  imageUrl?: string
  title?: string
  description?: string
  lastPhotoTimestamp?: string
  onDelete?: () => void
}

const cardVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
}

export default function MyViewer({
  imageUrl,
  title,
  description,
  lastPhotoTimestamp,
  onDelete,
}: MyViewerProps) {
  const { language, translations } = useLanguage()
  const t = translations[language].myViewer

  const [showConfetti, setShowConfetti] = useState(false)
  const [notification, setNotification] = useState<{
    message: string
    type: 'success' | 'error'
  } | null>(null)
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const triggerConfetti = useCallback(() => {
    setShowConfetti(true)
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f97316', '#7c3aed', '#fbbf24', '#10b981', '#ef4444'],
    })
    setTimeout(() => setShowConfetti(false), 3000)
  }, [])

  const showNotification = useCallback(
    (message: string, type: 'success' | 'error') => {
      setNotification({ message, type })
      setTimeout(() => setNotification(null), 3000)
    },
    [],
  )

  const handleDownload = useCallback(async () => {
    if (imageUrl) {
      try {
        const response = await fetch(
          `/api/download-image?imageUrl=${encodeURIComponent(imageUrl)}`,
        )
        if (!response.ok) throw new Error('Download failed')

        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = 'spooky-image.jpg'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)

        triggerConfetti()
        showNotification(t.notifications.downloadSuccess, 'success')
      } catch (error) {
        console.error('Download failed:', error)
        showNotification(t.notifications.downloadError, 'error')
      }
    }
  }, [imageUrl, triggerConfetti, showNotification, t.notifications])

  const handleCopyUrl = useCallback(() => {
    if (imageUrl) {
      navigator.clipboard
        .writeText(imageUrl)
        .then(() => {
          showNotification(t.notifications.copySuccess, 'success')
        })
        .catch((error) => {
          console.error('Copy failed:', error)
          showNotification(t.notifications.copyError, 'error')
        })
    }
  }, [imageUrl, showNotification, t.notifications])
  const handleShare = useCallback(async () => {
    if (imageUrl && navigator.share) {
      try {
        const response = await fetch(
          `/api/download-image?imageUrl=${encodeURIComponent(imageUrl)}`,
        )

        if (!response.ok) {
          throw new Error('Failed to fetch image for sharing')
        }

        const blob = await response.blob()

        const file = new File([blob], 'spooklens-image.jpg', {
          type: 'image/jpeg',
        })

        await navigator.share({
          title: title || t.defaultImageTitle,
          text: description || t.defaultImageDescription,
          files: [file],
        })

        showNotification(t.notifications.shareSuccess, 'success')
      } catch (error) {
        console.error('Share failed:', error)
        showNotification(t.notifications.shareError, 'error')
      }
    } else {
      showNotification(t.notifications.shareNotSupported, 'error')
    }
  }, [imageUrl, title, description, showNotification, t])

  const handleDelete = useCallback(() => {
    if (onDelete) {
      onDelete()
      showNotification(t.notifications.deleteSuccess, 'success')
    }
  }, [onDelete, showNotification, t.notifications])

  useEffect(() => {
    if (showConfetti) {
      const timeoutId = setTimeout(() => setShowConfetti(false), 3000)
      return () => clearTimeout(timeoutId)
    }
  }, [showConfetti])

  return (
    <div className="flex flex-col h-full rounded-lg shadow-lg">
      <CardHeader className="p-2 sm:p-4">
        <CardTitle className="text-xl sm:text-2xl font-bold text-orange-300 flex items-center justify-center font-halloween">
          <GiPumpkin
            className="mr-2 h-5 w-5 sm:h-6 sm:w-6 text-orange-500"
            aria-hidden="true"
          />
          <span>{t.title}</span>
          <GiCandleSkull
            className="ml-2 h-5 w-5 sm:h-6 sm:w-6 text-orange-500"
            aria-hidden="true"
          />
        </CardTitle>
      </CardHeader>
      <CardContent className="relative flex-grow p-2 sm:p-4 flex flex-col">
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <GiSpiderWeb
            className="absolute top-0 left-0 text-purple-500/20 h-12 w-12 sm:h-16 sm:w-16"
            aria-hidden="true"
          />
          <GiSpiderWeb
            className="absolute top-0 right-0 text-purple-500/20 h-12 w-12 sm:h-16 sm:w-16 transform scale-x-[-1]"
            aria-hidden="true"
          />
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={imageUrl || 'placeholder'}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="relative flex-grow mb-2 sm:mb-4 rounded-lg overflow-hidden"
          >
            {imageUrl ? (
              <>
                <Image
                  src={imageUrl}
                  alt={title || t.defaultImageTitle}
                  fill
                  className={`object-cover transition-opacity duration-300 ${
                    isImageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  onLoad={() => setIsImageLoaded(true)}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/30" />
                <div className="absolute top-0 left-0 w-full p-2 sm:p-4 text-center z-10">
                  <h3 className="text-base sm:text-lg font-bold text-orange-300 line-clamp-1">
                    {title || t.defaultImageTitle}
                  </h3>
                  <p className="text-xs sm:text-sm text-orange-200 mt-1 line-clamp-2">
                    {description || t.defaultImageDescription}
                  </p>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full bg-purple-800/30 rounded-lg p-2 sm:p-4">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <Image
                    src="/images/sad-logo.png"
                    alt={t.altTexts.logo}
                    width={150}
                    height={150}
                    className="mb-2 sm:mb-4 filter drop-shadow-[0_0_20px_rgba(255,255,255,0.7)]"
                    draggable={false}
                  />
                </motion.div>
                <p className="text-lg sm:text-xl font-halloween text-center text-orange-300">
                  {t.noImageYet}
                </p>
                <p className="text-sm sm:text-base mt-1 text-orange-200 text-center">
                  {t.tryTrickOrTreat}
                </p>
              </div>
            )}
            {lastPhotoTimestamp && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="absolute bottom-2 right-2 bg-black/50 rounded-full p-1 sm:p-1.5 z-30">
                      <FaCamera
                        className="h-3 w-3 sm:h-4 sm:w-4 text-white"
                        aria-hidden="true"
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p className="text-xs sm:text-sm">
                      {t.lastPhoto}{' '}
                      {new Date(lastPhotoTimestamp).toLocaleString(language)}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </motion.div>
        </AnimatePresence>
        <div className="flex justify-center items-center space-x-2 mt-auto">
          <Button
            onClick={handleDownload}
            className="text-orange-300 bg-green-600/50 hover:bg-green-800 transition-all duration-300 text-xs sm:text-sm py-1 h-8 sm:h-9"
            disabled={!imageUrl}
            aria-label={t.ariaLabels.download}
          >
            <FaDownload className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            onClick={handleCopyUrl}
            className="text-orange-300 bg-purple-800/50 hover:bg-purple-700 transition-all duration-300 text-xs sm:text-sm py-1 h-8 sm:h-9"
            disabled={!imageUrl}
            aria-label={t.ariaLabels.copyUrl}
          >
            <FaLink className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            onClick={handleShare}
            className="text-orange-300 bg-purple-800/50 hover:bg-purple-700 transition-all duration-300 text-xs sm:text-sm py-1 h-8 sm:h-9"
            disabled={!imageUrl || !navigator.share}
            aria-label={t.ariaLabels.share}
          >
            <FaShare className="h-4 w-4" aria-hidden="true" />
          </Button>
          <AlertDialog
            open={showDeleteConfirm}
            onOpenChange={setShowDeleteConfirm}
          >
            <AlertDialogTrigger asChild>
              <Button
                className="text-orange-300 bg-red-800/50 hover:bg-red-700 transition-all duration-300 text-xs sm:text-sm py-1 h-8 sm:h-9"
                disabled={!imageUrl}
                aria-label={t.ariaLabels.delete}
              >
                <FaTrash className="h-4 w-4" aria-hidden="true" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-gradient-to-b from-gray-900 to-gray-800 text-orange-200 border-2 border-orange-500 rounded-lg shadow-lg shadow-orange-500/20">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-2xl font-halloween text-orange-500">
                  {t.deleteConfirmTitle}
                </AlertDialogTitle>
                <AlertDialogDescription className="text-orange-200">
                  {t.deleteConfirmDescription}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-transparent border-orange-500 text-orange-300 hover:bg-orange-500/20">
                  {t.cancel}
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {t.delete}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 z-50"
          >
            <div
              className={`p-4 rounded-md shadow-lg text-center text-sm ${
                notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
              } text-white`}
            >
              {notification.message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
