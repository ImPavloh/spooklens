/* funciona pero no se usa aun (usar para chats)
'use client'

import { useState, useEffect } from 'react'

import { doc, getDoc } from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'
import { User } from 'firebase/auth'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

import { useLanguage } from '@/utils/LanguageContext'

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

export default function UserProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { language, translations } = useLanguage()
  const t = translations[language].userProfilePage

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user: User | null) => {
      if (user) {
        fetchUserProfile(user.uid)
      } else {
        setLoading(false)
        setError(t.errors.noAuthenticatedUser)
      }
    })

    return () => unsubscribe()
  }, [t.errors.noAuthenticatedUser])

  const fetchUserProfile = async (uid: string) => {
    try {
      const userRef = doc(db, 'users', uid)
      const userSnap = await getDoc(userRef)

      if (userSnap.exists()) {
        const userData = userSnap.data() as UserProfile
        setProfile(userData)
      } else {
        setError(t.errors.userProfileNotFound)
      }
    } catch (err) {
      setError(t.errors.fetchingUserProfile)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSkeleton />
  }

  if (error) {
    return <ErrorMessage message={error} />
  }

  if (!profile) {
    return <ErrorMessage message={t.errors.profileNotAvailable} />
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          {t.title.replace('{username}', profile.username)}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="w-24 h-24">
            <AvatarImage src={profile.avatar} alt={profile.username} />
            <AvatarFallback>
              {profile.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="text-center">
            <p className="text-lg font-semibold">{profile.username}</p>
            <p className="text-sm text-gray-500">{profile.bio}</p>
          </div>
          <div className="w-full space-y-2">
            <ProfileItem label={t.labels.totalCandies} value={profile.totalCandies} />
            <ProfileItem label={t.labels.totalSpins} value={profile.totalSpins} />
            <ProfileItem label={t.labels.potions} value={profile.potions} />
            <ProfileItem
              label={t.labels.profileVisible}
              value={profile.profileVisible ? t.values.yes : t.values.no}
            />
            <ProfileItem
              label={t.labels.notifications}
              value={profile.notificationsEnabled ? t.values.enabled : t.values.disabled}
            />
            <ProfileItem
              label={t.labels.memberSince}
              value={new Date(profile.createdAt).toLocaleDateString(language)}
            />
          </div>
          <Button className="w-full">{t.buttons.editProfile}</Button>
        </div>
      </CardContent>
    </Card>
  )
}

const ProfileItem = ({
  label,
  value,
}: {
  label: string
  value: string | number | boolean
}) => (
  <div className="flex justify-between">
    <span className="font-medium">{label}:</span>
    <span>{value.toString()}</span>
  </div>
)

const LoadingSkeleton = () => {
  const { language, translations } = useLanguage()
  const t = translations[language].userProfilePage

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <Skeleton className="h-8 w-3/4 mx-auto" />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-4">
          <Skeleton className="w-24 h-24 rounded-full" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
          <div className="w-full space-y-2">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
          <Skeleton className="h-10 w-full" />
        </div>
      </CardContent>
    </Card>
  )
}

const ErrorMessage = ({ message }: { message: string }) => (
  <Card className="w-full max-w-md mx-auto">
    <CardContent>
      <p className="text-center text-red-500">{message}</p>
    </CardContent>
  </Card>
)
*/
