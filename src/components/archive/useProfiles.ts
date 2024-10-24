import { useState, useEffect } from 'react'

import {
  collection,
  getDocs,
  query,
  where,
  limit,
  startAfter,
  orderBy,
} from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'

interface Profile {
  id: string
  imageUrl?: string
  name: string
  bio?: string
  age?: number
  interests?: string[]
}

export const useProfiles = () => {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastVisible, setLastVisible] = useState<any>(null)

  const fetchProfiles = async (isInitial = false) => {
    try {
      setLoading(true)
      let q = query(
        collection(db, 'users'),
        where('id', '!=', auth.currentUser?.uid),
        orderBy('id'),
        limit(10)
      )

      if (!isInitial && lastVisible) {
        q = query(q, startAfter(lastVisible))
      }

      const querySnapshot = await getDocs(q)
      const users: Profile[] = querySnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Profile)
      )

      setProfiles((prev) => (isInitial ? users : [...prev, ...users]))
      setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1])
    } catch (err) {
      setError('Error loading profiles. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfiles(true)
  }, [])

  const fetchMoreProfiles = () => fetchProfiles(false)

  return { profiles, loading, error, fetchMoreProfiles }
}