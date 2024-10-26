'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  FaGhost,
  FaEye,
  FaCalendarAlt,
  FaCandyCane,
  FaLock,
  FaFlask,
  FaTrophy,
  FaTrash,
  FaEdit,
  FaCamera,
} from 'react-icons/fa'
import { GiPumpkin } from 'react-icons/gi'

import { doc, updateDoc, deleteDoc } from 'firebase/firestore'
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
} from 'firebase/auth'
import { db, auth } from '@/lib/firebase'

import BackgroundAnimation from '@/components/extras/BackgroundAnimation'
import PhotoGallery from '@/components/PhotoGallery'

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }
  return new Intl.DateTimeFormat('en-US', options).format(date)
}

interface AlertState {
  type: 'success' | 'error'
  message: string
}

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

interface LocalSettings {
  disableBackgroundImage: boolean
}

interface UserProfilePageProps {
  profileData: UserProfile
}

export default function UserProfilePage({ profileData }: UserProfilePageProps) {
  const [profile, setProfile] = useState<UserProfile>(profileData)
  const [isEditing, setIsEditing] = useState(false)
  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [alert, setAlert] = useState<AlertState | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [isReauthenticating, setIsReauthenticating] = useState(false)
  const [localSettings] = useState<LocalSettings>(() => {
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('localSettings')
      return savedSettings
        ? JSON.parse(savedSettings)
        : {
            disableBackgroundImage: false,
          }
    }
    return {
      disableBackgroundImage: false,
    }
  })

  const router = useRouter()
  const isOwnProfile = auth.currentUser?.uid === profile.uid

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('localSettings', JSON.stringify(localSettings))
    }
  }, [localSettings])

  const handleCredentialChange = async (changeType: 'email' | 'password') => {
    if (!isOwnProfile) {
      return setAlert({
        type: 'error',
        message: 'You can only change credentials for your own profile.',
      })
    }

    try {
      const user = auth.currentUser
      if (!user) throw new Error('No authenticated user')

      await reauthenticateWithCredential(
        user,
        EmailAuthProvider.credential(user.email!, currentPassword),
      )
      if (changeType === 'password') {
        await updatePassword(user, newPassword)
      }
      setAlert({
        type: 'success',
        message:
          changeType === 'email'
            ? 'Your new spectral address has been conjured successfully!'
            : 'Your new secret password has been conjured successfully!',
      })
    } catch (error) {
      console.error(`Error updating ${changeType}:`, error)
      setAlert({
        type: 'error',
        message:
          changeType === 'email'
            ? 'The spirits rejected your new address. Check your current password and try again.'
            : 'The dark forces rejected your new incantation. Verify your current password and try again.',
      })
    }
  }

  const handleProfileUpdate = async (updatedProfile: Partial<UserProfile>) => {
    if (profile && isOwnProfile) {
      try {
        const userRef = doc(db, 'users', profile.uid)
        await updateDoc(userRef, updatedProfile)
        setProfile({ ...profile, ...updatedProfile })
        setAlert({
          type: 'success',
          message: 'The spectral profile has been updated successfully!',
        })
      } catch (error) {
        console.error('Error updating profile:', error)
        setAlert({
          type: 'error',
          message:
            'The spirits were unable to update the profile. Please try again.',
        })
      }
    }
  }

  const handleDeleteAccount = async () => {
    if (!isOwnProfile) return

    if (deleteConfirmation !== profile.username) {
      setAlert({
        type: 'error',
        message:
          'The username confirmation does not match. Your account remains intact.',
      })
      return
    }

    try {
      setIsReauthenticating(true)
      const user = auth.currentUser
      if (!user) throw new Error('No authenticated user')

      const credential = EmailAuthProvider.credential(user.email!, password)
      await reauthenticateWithCredential(user, credential)

      await deleteDoc(doc(db, 'users', user.uid))
      await deleteUser(user)

      setIsDeleteDialogOpen(false)
      setAlert({
        type: 'success',
        message: 'Your spectral presence has been banished from this realm.',
      })

      router.push('/')
    } catch (error) {
      console.error('Error deleting account:', error)
      setAlert({
        type: 'error',
        message:
          'Failed to delete account. Please check your password and try again.',
      })
    } finally {
      setIsReauthenticating(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-16 md:pt-24 flex flex-col bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 text-orange-200 overflow-hidden pb-8 relative"
    >
      {!localSettings.disableBackgroundImage && (
        <BackgroundAnimation
          numWebs={20}
          webColor="text-orange-300"
          opacity={0.15}
        />
      )}
      <main className="flex-grow flex flex-col items-center px-4 lg:px-0 relative">
        <div className="w-full max-w-5xl">
          <motion.h1
            className="mb-2 p-2 text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-wider text-center text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-purple-600 animate-gradient-x drop-shadow-[0_5px_3px_rgba(0,0,0,0.4)]"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {profile.username}&apos;s Haunted Profile
          </motion.h1>
          <motion.p
            className="mb-8 text-center text-lg md:text-xl lg:text-2xl text-orange-300"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Explore your spectral achievements and customize your ghostly
            presence!
          </motion.p>

          <Card className="bg-gradient-to-br from-[#1a1a1d] to-[#2c003e] border-orange-500 text-orange-200 overflow-hidden rounded-2xl shadow-2xl shadow-orange-500/30 transition-shadow duration-300">
            <CardContent className="p-4 md:p-6">
              <Tabs defaultValue="profile" className="w-full mt-4 md:mt-6">
                <TabsList className="grid w-full grid-cols-3 bg-gray-800/50 backdrop-blur-sm rounded-full p-1 gap-2 mb-4 md:mb-6">
                  <TabsTrigger
                    value="profile"
                    className="rounded-full data-[state=active]:bg-orange-500 data-[state=active]:text-white transition-all duration-300"
                  >
                    <FaGhost className="mr-2 h-4 w-4" />
                    <span className="hidden md:inline">Profile</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="photos"
                    className="rounded-full data-[state=active]:bg-orange-500 data-[state=active]:text-white transition-all duration-300"
                  >
                    <FaCamera className="mr-2 h-4 w-4" />
                    <span className="hidden md:inline">Spooky Pics</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="stats"
                    className="rounded-full data-[state=active]:bg-orange-500 data-[state=active]:text-white transition-all duration-300"
                  >
                    <FaTrophy className="mr-2 h-4 w-4" />
                    <span className="hidden md:inline">Haunting Stats</span>
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="profile">
                  <ScrollArea className="h-[450px] md:h-[550px] pr-4">
                    <div className="space-y-6">
                      <ProfileImage imageUrl={profile.avatar} />
                      <p className="text-center text-xl text-orange-300">
                        @{profile.username}
                      </p>
                      {isEditing && isOwnProfile ? (
                        <ProfileEdit
                          profile={profile}
                          onUpdate={handleProfileUpdate}
                          setIsEditing={setIsEditing}
                          setIsDeleteDialogOpen={setIsDeleteDialogOpen}
                        />
                      ) : (
                        <ProfileView
                          profile={profile}
                          setIsEditing={setIsEditing}
                          isOwnProfile={isOwnProfile}
                        />
                      )}
                      {isEditing && isOwnProfile && (
                        <CredentialChangeForm
                          currentPassword={currentPassword}
                          setCurrentPassword={setCurrentPassword}
                          newPassword={newPassword}
                          setNewPassword={setNewPassword}
                          onPasswordChange={() =>
                            handleCredentialChange('password')
                          }
                        />
                      )}
                    </div>
                  </ScrollArea>
                  <AlertMessage alert={alert} />
                </TabsContent>
                <TabsContent value="photos">
                  <ScrollArea className="h-[450px] md:h-[550px] pr-4">
                    <PhotoGallery
                      userId={profile.uid}
                      isOwnProfile={isOwnProfile}
                    />
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="stats">
                  <ScrollArea className="h-[450px] md:h-[550px] pr-4">
                    <StatsView profile={profile} />
                  </ScrollArea>
                </TabsContent>
              </Tabs>

              <Dialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
              >
                <DialogContent className="bg-gray-800 text-orange-200 border-2 border-red-500 max-w-[90vw] md:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-xl md:text-2xl font-bold text-red-500">
                      Confirm Spectral Banishment
                    </DialogTitle>
                    <DialogDescription className="text-orange-300 text-sm md:text-base">
                      This dark ritual will permanently erase your presence from
                      this haunted realm. All your data, including candies and
                      photos, will be lost to the void.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Label
                      htmlFor="deleteConfirmation"
                      className="text-orange-400 text-sm md:text-base"
                    >
                      Type your username to confirm:{' '}
                      <span className="font-bold">{profile.username}</span>
                    </Label>
                    <Input
                      variant="orange"
                      id="deleteConfirmation"
                      value={deleteConfirmation}
                      onChange={(e) => setDeleteConfirmation(e.target.value)}
                      className="mt-2 w-full bg-gray-700 text-orange-300 border-red-500"
                    />
                    <Label
                      htmlFor="password"
                      className="text-orange-400 mt-4 block text-sm md:text-base"
                    >
                      Enter your password:
                    </Label>
                    <Input
                      variant="orange"
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="mt-2 w-full bg-gray-700 text-orange-300 border-red-500"
                    />
                  </div>
                  {alert && alert.type === 'error' && (
                    <Alert variant="destructive">
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{alert.message}</AlertDescription>
                    </Alert>
                  )}
                  <DialogFooter className="flex flex-col sm:flex-row gap-2">
                    <Button
                      className="bg-red-200 text-red-800  w-full sm:w-auto"
                      onClick={() => setIsDeleteDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-red-800 text-red-200 w-full sm:w-auto"
                      onClick={handleDeleteAccount}
                      disabled={isReauthenticating}
                    >
                      {isReauthenticating
                        ? 'Banishing...'
                        : 'Confirm Banishment'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      </main>
    </motion.div>
  )
}

const ProfileImage = ({ imageUrl }: { imageUrl: string }) => (
  <div className="relative w-32 h-32 md:w-40 md:h-40 mx-auto">
    <div className="w-full h-full rounded-full bg-gray-700 border-4 border-orange-500 overflow-hidden shadow-lg transition-all duration-300">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt="User avatar"
          layout="fill"
          objectFit="cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <FaGhost className="text-orange-500 h-16 w-16 md:h-20 md:w-20" />
        </div>
      )}
    </div>
  </div>
)

const ProfileView = ({
  profile,
  setIsEditing,
  isOwnProfile,
}: {
  profile: UserProfile
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>
  isOwnProfile: boolean
}) => (
  <div className="space-y-4">
    <div>
      <h3 className="text-lg md:text-xl font-semibold text-orange-400 mb-2">
        Spectral Biography
      </h3>
      <p className="text-sm md:text-base text-gray-300 bg-purple-900/30 p-4 rounded-lg">
        {profile.bio}
      </p>
    </div>
    <div className="flex items-center space-x-2 bg-purple-900/30 p-4 rounded-lg">
      <FaEye className="text-orange-500" />
      <span className="text-sm md:text-base text-gray-300">
        {profile.profileVisible
          ? 'Visible to other spirits'
          : 'Hidden from mortal eyes'}
      </span>
    </div>
    {isOwnProfile && (
      <Button
        onClick={() => setIsEditing(true)}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white transition-all duration-300 transform"
      >
        <FaEdit className="mr-2" />
        Edit Profile
      </Button>
    )}
  </div>
)

const ProfileEdit = ({
  profile,
  onUpdate,
  setIsEditing,
  setIsDeleteDialogOpen,
}: {
  profile: UserProfile
  onUpdate: (updatedProfile: Partial<UserProfile>) => Promise<void>
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>
  setIsDeleteDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
}) => {
  const [bio, setBio] = useState(profile.bio)
  const [profileVisible] = useState(profile.profileVisible)
  const [notificationsEnabled] = useState(profile.notificationsEnabled)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdate({ bio, profileVisible, notificationsEnabled })
    setIsEditing(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="bio" className="text-orange-400 text-sm md:text-base">
          Spectral Biography
        </Label>
        <Textarea
          variant="orange"
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="w-full bg-gray-700 text-orange-300 border-orange-500 text-sm md:text-base"
          rows={4}
        />
      </div>
      <Button
        type="submit"
        className="w-full bg-orange-500 hover:bg-orange-600 text-white transition-all duration-300 transform"
      >
        Update Profile
      </Button>
      <Button
        type="button"
        onClick={() => setIsDeleteDialogOpen(true)}
        className="w-full bg-red-600 hover:bg-red-700 text-white transition-all duration-300 transform"
      >
        <FaTrash className="mr-2" />
        Banish Your Spectral Presence
      </Button>
    </form>
  )
}

const CredentialChangeForm = ({
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  onPasswordChange,
}: {
  currentPassword: string
  setCurrentPassword: React.Dispatch<React.SetStateAction<string>>
  newPassword: string
  setNewPassword: React.Dispatch<React.SetStateAction<string>>
  onPasswordChange: () => void
}) => (
  <div className="mt-6 space-y-4 bg-purple-900/30 p-4 md:p-6 rounded-lg">
    <h3 className="text-xl md:text-2xl font-semibold text-orange-500 mb-4">
      Change Spectral Credentials
    </h3>
    <div>
      <Label
        htmlFor="currentPassword"
        className="text-orange-400 text-sm md:text-base"
      >
        Current Incantation
      </Label>
      <Input
        variant="orange"
        type="password"
        id="currentPassword"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        className="w-full bg-gray-700 text-orange-300 border-orange-500 text-sm md:text-base"
      />
    </div>
    <div>
      <Label
        htmlFor="newPassword"
        className="text-orange-400 text-sm md:text-base"
      >
        New Secret Incantation
      </Label>
      <Input
        variant="orange"
        type="password"
        id="newPassword"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        className="w-full bg-gray-700 text-orange-300 border-orange-500 text-sm md:text-base"
      />
      <Button
        onClick={onPasswordChange}
        className="mt-2 w-full bg-orange-500 hover:bg-orange-600 text-white transition-all duration-300 transform"
      >
        <FaLock className="mr-2" />
        Cast New Spell
      </Button>
    </div>
  </div>
)

const AlertMessage = ({ alert }: { alert: AlertState | null }) => (
  <AnimatePresence>
    {alert && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Alert
          className={`mt-4 ${
            alert.type === 'error'
              ? 'bg-red-900/50 text-red-300 border border-red-500'
              : 'bg-green-900/50 text-green-300 border border-green-500'
          }`}
        >
          <AlertTitle
            className={`${
              alert.type === 'error' ? 'text-red-300' : 'text-green-300'
            } text-sm md:text-base`}
          >
            {alert.type === 'error' ? 'Dark Omen' : 'Mystical Success'}
          </AlertTitle>
          <AlertDescription className="text-sm md:text-base">
            {alert.message}
          </AlertDescription>
        </Alert>
      </motion.div>
    )}
  </AnimatePresence>
)

const StatsView = ({ profile }: { profile: UserProfile }) => (
  <div className="space-y-4 md:space-y-6 mt-4">
    {[
      {
        icon: FaCalendarAlt,
        label: 'Haunting Since',
        value: formatDate(profile.createdAt),
        isDate: true,
      },
      {
        icon: FaCandyCane,
        label: 'Total Candies Collected',
        value: profile.totalCandies,
      },
      { icon: GiPumpkin, label: 'Total Spins', value: profile.totalSpins },
      { icon: FaFlask, label: 'Magical Potions', value: profile.potions },
    ].map((stat, index) => (
      <div
        key={index}
        className="flex items-center space-x-4 bg-purple-900/30 p-3 md:p-4 rounded-lg hover:bg-purple-800/40 transition-colors duration-300"
      >
        <div className="bg-orange-500 p-2 md:p-3 rounded-full">
          <stat.icon className="text-lg md:text-2xl" aria-hidden="true" />
        </div>
        <div>
          <h4 className="text-base md:text-lg font-semibold text-orange-400 mb-1">
            {stat.label}
          </h4>
          {stat.isDate ? (
            <time
              dateTime={profile.createdAt}
              className="text-gray-300 text-xs md:text-sm"
            >
              {stat.value}
            </time>
          ) : (
            <span className="text-gray-300 text-xs md:text-sm">
              {stat.value}
            </span>
          )}
        </div>
      </div>
    ))}
  </div>
)
