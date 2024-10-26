'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { FaSpinner, FaTrash } from 'react-icons/fa'

import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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

import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

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

function formatDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
  return new Intl.DateTimeFormat('en-US', options).format(date)
}

export default function PhotoGallery({
  userId,
  isOwnProfile,
}: PhotoGalleryProps) {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [photoToDelete, setPhotoToDelete] = useState<string | null>(null)

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
      }
    } catch (error) {
      console.error('Error deleting photo:', error)
      // You might want to add some error handling here, like showing an alert to the user
    }
  }

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
      <div className="flex items-center justify-center h-[450px]">
        <FaSpinner className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <ScrollArea className="h-[450px] pr-4">
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {photos.map((photo) => (
          <motion.div key={photo.id} variants={itemVariants}>
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative aspect-[9/16] group">
                  <Image
                    src={photo.imageUrl}
                    alt={photo.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  {isOwnProfile && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="icon"
                          className="cursor-pointer rounded-lg bg-purple-200 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
                          onClick={() => setPhotoToDelete(photo.id)}
                        >
                          <FaTrash className="h-4 w-4" />
                          <span className="sr-only">Delete Photo</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you absolutely sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete your photo from your profile.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel
                            onClick={() => setPhotoToDelete(null)}
                          >
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => {
                              if (photoToDelete) {
                                deletePhoto()
                                setPhotoToDelete(null)
                              }
                            }}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <h3 className="text-white text-lg font-semibold mb-1">
                      {photo.title}
                    </h3>
                    <p className="text-white/80 text-sm line-clamp-2 mb-2">
                      {photo.description}
                    </p>
                    <time className="text-white/60 text-xs">
                      {formatDate(photo.createdAt)}
                    </time>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
      {photos.length === 0 && !isLoading && (
        <>
          <Image
            src="/images/sad-logo.png"
            alt="SpookLens"
            width={150}
            height={150}
            className="h-32 w-32 mx-auto my-2 sm:my-4 filter drop-shadow-[0_0_20px_rgba(255,255,255,0.7)]"
            draggable={false}
            priority
          />
          <p className="text-center text-muted-foreground mt-8">
            No photos found.
          </p>
        </>
      )}
    </ScrollArea>
  )
}
