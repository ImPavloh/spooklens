'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { FaTrash, FaInfoCircle, FaDownload } from 'react-icons/fa'
import { GiSpiderWeb } from 'react-icons/gi'

import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

import { useLanguage } from '@/utils/LanguageContext'

import confetti from 'canvas-confetti'

interface ImageHistoryItem {
  imageUrl: string
  title: string
  description: string
  createdAt: {
    toDate: () => Date
  }
}

interface UserData {
  imageHistory?: Record<string, ImageHistoryItem>
}

interface Photo {
  id: string
  imageUrl: string
  title: string
  description: string
  createdAt: Date
}

interface PhotoGalleryProps {
  userId: string
  isOwnProfile: boolean
}

const PhotoSkeleton = () => (
  <Card className="overflow-hidden bg-purple-800/30">
    <CardContent className="p-0">
      <div className="relative aspect-[9/16]">
        <Skeleton className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1d] to-[#2c003e]  flex flex-col justify-between p-2">
          <div className="flex justify-end space-x-2">
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="w-8 h-8 rounded-full" />
          </div>
          <div>
            <Skeleton className="h-4 w-3/4 mb-1" />
            <Skeleton className="h-3 w-1/2 mb-1" />
            <Skeleton className="h-2 w-1/4" />
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
)

export default function PhotoGallery({
  userId,
  isOwnProfile,
}: PhotoGalleryProps) {
  const { language, translations } = useLanguage()
  const t = translations[language].photoGallery

  const [photos, setPhotos] = useState<Photo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [photoToDelete, setPhotoToDelete] = useState<string | null>(null)
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [notification, setNotification] = useState<{
    message: string
    type: 'success' | 'error'
  } | null>(null)

  const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
    return new Intl.DateTimeFormat(language, options).format(date)
  }

  const deletePhoto = async () => {
    if (!photoToDelete) return
    try {
      const userRef = doc(db, 'users', userId)
      const userSnap = await getDoc(userRef)
      if (userSnap.exists()) {
        const userData = userSnap.data() as UserData
        const updatedImageHistory = { ...userData.imageHistory }
        delete updatedImageHistory[photoToDelete]
        await updateDoc(userRef, { imageHistory: updatedImageHistory })
        setPhotos(photos.filter((photo) => photo.id !== photoToDelete))
        showNotification(t.notifications.deleteSuccess, 'success')
      }
    } catch (error) {
      console.error('Error deleting photo:', error)
      showNotification(t.notifications.deleteError, 'error')
    }
  }

  const triggerConfetti = useCallback(() => {
    confetti({
      particleCount: 75,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#f97316', '#7c3aed', '#fbbf24'],
    })
  }, [])

  const showNotification = useCallback(
    (message: string, type: 'success' | 'error') => {
      setNotification({ message, type })
      setTimeout(() => setNotification(null), 3000)
    },
    [],
  )

  const downloadPhoto = useCallback(
    async (photo: Photo) => {
      try {
        const response = await fetch(
          `/api/download-image?imageUrl=${encodeURIComponent(photo.imageUrl)}`,
        )
        if (!response.ok) throw new Error('Download failed')

        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${photo.title}.jpg`
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
    },
    [
      showNotification,
      t.notifications.downloadError,
      t.notifications.downloadSuccess,
      triggerConfetti,
    ],
  )

  useEffect(() => {
    const fetchPhotos = async () => {
      setIsLoading(true)
      const userRef = doc(db, 'users', userId)
      const userSnap = await getDoc(userRef)

      if (userSnap.exists()) {
        const userData = userSnap.data() as UserData
        const imageHistory = userData.imageHistory || {}

        const photoArray = Object.entries(imageHistory).map(
          ([id, data]: [string, ImageHistoryItem]) => ({
            id,
            imageUrl: data.imageUrl,
            title: data.title,
            description: data.description,
            createdAt: data.createdAt.toDate(),
          }),
        )

        setPhotos(
          photoArray.sort(
            (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
          ),
        )
      }
      setIsLoading(false)
    }

    fetchPhotos()
  }, [userId])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
        {[...Array(8)].map((_, index) => (
          <PhotoSkeleton key={index} />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
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
        <ScrollArea className="w-full pr-4 flex-grow">
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence>
              {photos.map((photo) => (
                <motion.div
                  key={photo.id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  layout
                >
                  <Card className="overflow-hidden bg-purple-800/30 hover:bg-purple-700/40 transition-colors duration-300">
                    <CardContent className="p-0">
                      <div className="relative aspect-[9/16] group">
                        <Image
                          src={photo.imageUrl}
                          alt={photo.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-2">
                          <div className="flex justify-end space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="icon"
                                  className="cursor-pointer rounded-full bg-blue-600/80 hover:bg-blue-700 transition-colors duration-300 z-10"
                                  onClick={() => setSelectedPhoto(photo)}
                                >
                                  <FaInfoCircle className="h-4 w-4" />
                                  <span className="sr-only">{t.viewInfo}</span>
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-gradient-to-b from-gray-900 to-gray-800 text-orange-200 border-2 border-orange-500 rounded-lg shadow-lg shadow-orange-500/20 w-11/12 max-w-lg">
                                <DialogHeader>
                                  <DialogTitle className="text-2xl font-halloween text-orange-500">
                                    {photo.title}
                                  </DialogTitle>
                                </DialogHeader>
                                <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                  <Image
                                    src={photo.imageUrl}
                                    alt={photo.title}
                                    width={200}
                                    height={300}
                                    className="object-cover rounded-lg"
                                  />
                                  <div className="flex-1">
                                    <p className="text-orange-200">
                                      {photo.description}
                                    </p>
                                    <p className="mt-2 text-sm text-orange-300">
                                      {formatDate(photo.createdAt)}
                                    </p>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button
                              size="icon"
                              className="cursor-pointer rounded-full bg-green-600/80 hover:bg-green-700 transition-colors duration-300 z-10"
                              onClick={() => downloadPhoto(photo)}
                            >
                              <FaDownload className="h-4 w-4" />
                              <span className="sr-only">{t.downloadPhoto}</span>
                            </Button>
                            {isOwnProfile && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="icon"
                                    className="cursor-pointer rounded-full bg-red-800/80 hover:bg-red-900 transition-colors duration-300 z-10"
                                    onClick={() => setPhotoToDelete(photo.id)}
                                  >
                                    <FaTrash className="h-4 w-4" />
                                    <span className="sr-only">
                                      {t.deletePhoto}
                                    </span>
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="sm:max-w-[500px] w-11/12 max-h-[90vh] overflow-y-auto bg-gradient-to-b from-gray-900 to-gray-800 text-orange-200 border-2 border-orange-500 rounded-lg shadow-lg shadow-orange-500/20">
                                  <AlertDialogHeader className="space-y-2">
                                    <AlertDialogTitle className="text-3xl sm:text-4xl font-halloween text-orange-500 text-center">
                                      {t.deleteConfirmTitle}
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="text-orange-200 text-center text-base sm:text-lg">
                                      {t.deleteConfirmDescription}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter className="flex justify-center gap-4 mt-4">
                                    <AlertDialogCancel
                                      onClick={() => setPhotoToDelete(null)}
                                      className="bg-transparent border-orange-500 text-orange-300 hover:bg-orange-500/20 transition-colors duration-200"
                                    >
                                      {t.cancel}
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => {
                                        if (photo.id) {
                                          deletePhoto()
                                          setPhotoToDelete(null)
                                        }
                                      }}
                                      className="bg-orange-500 hover:bg-orange-600 text-white transition-colors duration-200"
                                    >
                                      {t.delete}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                          <div>
                            <h3 className="text-white text-sm font-semibold mb-1 line-clamp-1 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
                              {photo.title}
                            </h3>
                            <p className="text-white/80 text-xs line-clamp-2 mb-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                              {photo.description}
                            </p>
                            <time className="text-white/60 text-xs drop-shadow-[0_1px_0px_rgb(0,0,0)]">
                              {formatDate(photo.createdAt)}
                            </time>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
          {photos.length === 0 && !isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Image
                src="/images/sad-logo.png"
                alt={t.altTexts.logo}
                width={150}
                height={150}
                className="h-32 w-32 mx-auto my-2 sm:my-4 filter drop-shadow-[0_0_20px_rgba(255,255,255,0.7)]"
                draggable={false}
                priority
              />
              <p className="text-center text-orange-300 mt-8 font-halloween">
                {t.noPhotosFound}
              </p>
            </motion.div>
          )}
        </ScrollArea>
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
