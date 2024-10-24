import { useState, useEffect } from 'react'
import Image from 'next/image'

import { ScrollArea } from "@/components/ui/scroll-area"

import { doc, getDoc } from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'

interface Photo {
  id: string
  imageUrl: string
  title: string
  description: string
  createdAt: Date
}

export default function PhotoGallery() {
  const [photos, setPhotos] = useState<Photo[]>([])

  useEffect(() => {
    const fetchPhotos = async () => {
      const user = auth.currentUser
      if (!user) return

      const userRef = doc(db, 'users', user.uid)
      const userSnap = await getDoc(userRef)

      if (userSnap.exists()) {
        const userData = userSnap.data()
        const imageHistory = userData.imageHistory || {}

        const photoArray = Object.entries(imageHistory).map(([id, data]: [string, any]) => ({
          id,
          imageUrl: data.imageUrl,
          title: data.title,
          description: data.description,
          createdAt: data.createdAt.toDate()
        }))

        setPhotos(photoArray.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()))
      }
    }

    fetchPhotos()
  }, [])

  return (
    <ScrollArea className="h-[450px] pr-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
        {photos.map((photo) => (
          <div key={photo.id} className="relative group">
            <Image
              src={photo.imageUrl}
              alt={photo.title}
              width={300}
              height={300}
              className="rounded-lg object-cover shadow-lg"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center rounded-lg p-2">
              <span className="text-white text-sm font-bold mb-1">{photo.title}</span>
              <span className="text-white text-xs text-center">{photo.description}</span>
              <span className="text-white text-xs mt-2">
                {photo.createdAt.toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}