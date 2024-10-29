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

import { useLanguage } from '@/utils/LanguageContext'

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
  const { language, translations } = useLanguage()
  const t = translations[language].userProfilePage

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
        message: t.alerts.notOwnProfile,
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
            ? t.alerts.emailChangeSuccess
            : t.alerts.passwordChangeSuccess,
      })
    } catch (error) {
      console.error(`Error updating ${changeType}:`, error)
      setAlert({
        type: 'error',
        message:
          changeType === 'email'
            ? t.alerts.emailChangeError
            : t.alerts.passwordChangeError,
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
          message: t.alerts.profileUpdateSuccess,
        })
      } catch (error) {
        console.error('Error updating profile:', error)
        setAlert({
          type: 'error',
          message: t.alerts.profileUpdateError,
        })
      }
    }
  }

  const handleDeleteAccount = async () => {
    if (!isOwnProfile) return

    if (deleteConfirmation !== profile.username) {
      setAlert({
        type: 'error',
        message: t.alerts.deleteConfirmationMismatch,
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
        message: t.alerts.accountDeleteSuccess,
      })

      router.push('/')
    } catch (error) {
      console.error('Error deleting account:', error)
      setAlert({
        type: 'error',
        message: t.alerts.accountDeleteError,
      })
    } finally {
      setIsReauthenticating(false)
    }
  }

  return (
    <motion.div className="min-h-screen pt-16 md:pt-24 flex flex-col bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 text-orange-200 overflow-hidden pb-8 relative">
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
            {t.title.replace('{username}', profile.username)}
          </motion.h1>
          <motion.p
            className="mb-8 text-center text-lg md:text-xl lg:text-2xl text-orange-300"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {t.subtitle}
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
                    <span className="hidden md:inline">{t.tabs.profile}</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="photos"
                    className="rounded-full data-[state=active]:bg-orange-500 data-[state=active]:text-white transition-all duration-300"
                  >
                    <FaCamera className="mr-2 h-4 w-4" />
                    <span className="hidden md:inline">{t.tabs.photos}</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="stats"
                    className="rounded-full data-[state=active]:bg-orange-500 data-[state=active]:text-white transition-all duration-300"
                  >
                    <FaTrophy className="mr-2 h-4 w-4" />
                    <span className="hidden md:inline">{t.tabs.stats}</span>
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="profile">
                  <ScrollArea className="h-[450px] md:h-[500px] pr-4">
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
                          t={t}
                        />
                      ) : (
                        <ProfileView
                          profile={profile}
                          setIsEditing={setIsEditing}
                          isOwnProfile={isOwnProfile}
                          t={t}
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
                          t={t}
                        />
                      )}
                    </div>
                  </ScrollArea>
                  <AlertMessage alert={alert} t={t} />
                </TabsContent>
                <TabsContent value="photos">
                  <ScrollArea className="h-[450px] md:h-[500px] pr-4">
                    <PhotoGallery
                      userId={profile.uid}
                      isOwnProfile={isOwnProfile}
                    />
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="stats">
                  <ScrollArea className="h-[450px] md:h-[500px] pr-4">
                    <StatsView profile={profile} t={t} />
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
                      {t.deleteDialog.title}
                    </DialogTitle>
                    <DialogDescription className="text-orange-300 text-sm md:text-base">
                      {t.deleteDialog.description}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Label
                      htmlFor="deleteConfirmation"
                      className="text-orange-400 text-sm md:text-base"
                    >
                      {t.deleteDialog.confirmationLabel}{' '}
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
                      {t.deleteDialog.passwordLabel}
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
                      <AlertTitle>{t.alerts.errorTitle}</AlertTitle>
                      <AlertDescription>{alert.message}</AlertDescription>
                    </Alert>
                  )}
                  <DialogFooter className="flex flex-col sm:flex-row gap-2">
                    <Button
                      className="bg-red-200 text-red-800  w-full sm:w-auto"
                      onClick={() => setIsDeleteDialogOpen(false)}
                    >
                      {t.deleteDialog.cancelButton}
                    </Button>
                    <Button
                      className="bg-red-800 text-red-200 w-full sm:w-auto"
                      onClick={handleDeleteAccount}
                      disabled={isReauthenticating}
                    >
                      {isReauthenticating
                        ? t.deleteDialog.banishingButton
                        : t.deleteDialog.confirmButton}
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
  t,
}: {
  profile: UserProfile
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>
  isOwnProfile: boolean
  t: any
}) => (
  <div className="space-y-4">
    <div>
      <h3 className="text-lg md:text-xl font-semibold text-orange-400 mb-2">
        {t.profileView.bioTitle}
      </h3>
      <p className="text-sm md:text-base text-gray-300 bg-purple-900/30 p-4 rounded-lg">
        {profile.bio}
      </p>
    </div>
    <div className="flex items-center space-x-2 bg-purple-900/30 p-4 rounded-lg">
      <FaEye className="text-orange-500" />
      <span className="text-sm md:text-base text-gray-300">
        {profile.profileVisible
          ? t.profileView.visibleStatus
          : t.profileView.hiddenStatus}
      </span>
    </div>
    {isOwnProfile && (
      <Button
        onClick={() => setIsEditing(true)}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white transition-all duration-300 transform"
      >
        <FaEdit className="mr-2" />
        {t.profileView.editButton}
      </Button>
    )}
  </div>
)

const ProfileEdit = ({
  profile,
  onUpdate,
  setIsEditing,
  setIsDeleteDialogOpen,
  t,
}: {
  profile: UserProfile
  onUpdate: (updatedProfile: Partial<UserProfile>) => Promise<void>
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>
  setIsDeleteDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
  t: any
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
          {t.profileEdit.bioLabel}
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
        {t.profileEdit.updateButton}
      </Button>
      <Button
        type="button"
        onClick={() => setIsDeleteDialogOpen(true)}
        className="w-full bg-red-600 hover:bg-red-700 text-white transition-all duration-300 transform"
      >
        <FaTrash className="mr-2" />
        {t.profileEdit.deleteButton}
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
  t,
}: {
  currentPassword: string
  setCurrentPassword: React.Dispatch<React.SetStateAction<string>>
  newPassword: string
  setNewPassword: React.Dispatch<React.SetStateAction<string>>
  onPasswordChange: () => void
  t: any
}) => (
  <div className="mt-6 space-y-4 bg-purple-900/30 p-4 md:p-6 rounded-lg">
    <h3 className="text-xl md:text-2xl font-semibold text-orange-500 mb-4">
      {t.credentialChange.title}
    </h3>
    <div>
      <Label
        htmlFor="currentPassword"
        className="text-orange-400 text-sm md:text-base"
      >
        {t.credentialChange.currentPasswordLabel}
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
        {t.credentialChange.newPasswordLabel}
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
        {t.credentialChange.changeButton}
      </Button>
    </div>
  </div>
)

const AlertMessage = ({ alert, t }: { alert: AlertState | null; t: any }) => (
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
            {alert.type === 'error'
              ? t.alerts.errorTitle
              : t.alerts.successTitle}
          </AlertTitle>
          <AlertDescription className="text-sm md:text-base">
            {alert.message}
          </AlertDescription>
        </Alert>
      </motion.div>
    )}
  </AnimatePresence>
)

const StatsView = ({ profile, t }: { profile: UserProfile; t: any }) => (
  <div className="space-y-4 md:space-y-6 mt-4">
    {[
      {
        icon: FaCalendarAlt,
        label: t.stats.hauntingSince,
        value: new Date(profile.createdAt).toLocaleDateString(),
        isDate: true,
      },
      {
        icon: FaCandyCane,
        label: t.stats.totalCandies,
        value: profile.totalCandies,
      },
      { icon: GiPumpkin, label: t.stats.totalSpins, value: profile.totalSpins },
      { icon: FaFlask, label: t.stats.magicalPotions, value: profile.potions },
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
