'use client'

import { useEffect, useState } from 'react'
import { notFound } from 'next/navigation'
import { db, auth } from '@/lib/firebase'
import {
  collection,
  doc,
  getDoc,
  query,
  where,
  getDocs,
  limit,
} from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import UserProfilePage from '@/components/UserProfilePage'
import ErrorPage from '../../not-found'

export const dynamic = 'force-dynamic'

interface UserProfile {
  uid: string
  username: string
  bio: string
  avatar: string
  profileVisible: boolean
  notificationsEnabled: boolean
  createdAt: string
  totalCandies: number
  totalSpins: number
  potions: number
}

async function getUserData(identifier: string): Promise<UserProfile | null> {
  const cleanIdentifier = identifier.startsWith('@')
    ? identifier.slice(1)
    : identifier

  const userRef = doc(db, 'users', cleanIdentifier)
  let userSnap = await getDoc(userRef)

  if (!userSnap.exists()) {
    const usersRef = collection(db, 'users')
    const q = query(
      usersRef,
      where('username', '==', cleanIdentifier),
      limit(1),
    )
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      return null
    }

    userSnap = querySnapshot.docs[0]
  }

  const userData = userSnap.data() as Partial<UserProfile>

  return {
    uid: userSnap.id,
    username: userData.username || cleanIdentifier,
    bio: userData.bio || '',
    avatar: userData.avatar || '',
    profileVisible: userData.profileVisible || false,
    notificationsEnabled: userData.notificationsEnabled || false,
    createdAt: userData.createdAt || new Date().toISOString(),
    totalCandies: userData.totalCandies || 0,
    totalSpins: userData.totalSpins || 0,
    potions: userData.potions || 0,
  }
}

function getCurrentUserUid(): Promise<string | null> {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe()
      resolve(user ? user.uid : null)
    })
  })
}

export default function UserProfileWrapper({
  params,
}: {
  params: { username: string | string[] }
}) {
  const [profileData, setProfileData] = useState<UserProfile | null>(null)
  const [currentUserUid, setCurrentUserUid] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      const username = Array.isArray(params.username)
        ? params.username.join('/')
        : params.username || ''

      try {
        const userData = await getUserData(username)
        const currentUid = await getCurrentUserUid()
        setCurrentUserUid(currentUid)

        if (!userData) {
          setError('not-found')
        } else if (!userData.profileVisible && userData.uid !== currentUid) {
          setError('private')
        } else {
          setProfileData(userData)
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
        setError('error')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [params])

  if (isLoading) {
    return null
  }

  if (error === 'not-found') {
    notFound()
  }

  if (error === 'private') {
    return <ErrorPage isPrivate={true} />
  }

  if (error === 'error') {
    return <div>An error occurred while fetching the user profile.</div>
  }

  if (!profileData) {
    return null
  }

  return (
    <UserProfilePage
      profileData={profileData}
      currentUserUid={currentUserUid}
    />
  )
}
