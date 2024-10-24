/*
TODO:
- permitir a los usuarios cambiar la visibilidad del perfil
- arreglar profileVisibility -> profileVisible (estoy modificando un datos inexistente)
*/
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Slider } from '@/components/ui/slider'
import {
  FaUser,
  FaBell,
  FaEnvelope,
  FaEye,
  FaGhost,
  FaCog,
  FaImage,
  FaVolumeUp,
} from 'react-icons/fa'
import { GiPumpkin, GiSpiderWeb, GiMusicalNotes } from 'react-icons/gi'

import { useAuth } from '@/hooks/useAuth'
import { useFirestore } from '@/hooks/useFirestore'
import { useToast } from '@/hooks/useToast'

interface UserSettings {
  profileVisibility: boolean
}

interface LocalSettings {
  disableBackgroundImage: boolean
  lowPerformanceMode: boolean
  disableMusicPlayerAnimations: boolean
  disableChatBackgroundAnimations: boolean
  musicPlayerVolume: number
}

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { user } = useAuth()
  const { updateDocument, getDocument } = useFirestore()
  const { toast } = useToast()

  const [settings, setSettings] = useState<UserSettings>({
    profileVisibility: true,
  })

  const [localSettings, setLocalSettings] = useState<LocalSettings>(() => {
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('localSettings')
      return savedSettings
        ? JSON.parse(savedSettings)
        : {
            disableBackgroundImage: false,
            disableMusicPlayerAnimations: false,
            disableChatBackgroundAnimations: false,
            musicPlayerVolume: 50,
          }
    }
    return {
      disableBackgroundImage: false,
      disableMusicPlayerAnimations: false,
      disableChatBackgroundAnimations: false,
      musicPlayerVolume: 50,
    }
  })

  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState(false)

  useEffect(() => {
    if (user) {
      const fetchUserSettings = async () => {
        try {
          const userDoc = await getDocument('users', user.uid)
          if (userDoc) {
            setSettings({
              profileVisibility: userDoc.profileVisibility ?? false,
            })
          }
        } catch (error) {
          console.error('Error fetching user settings:', error)
        }
      }
      fetchUserSettings()
    }
  }, [user, getDocument])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('localSettings', JSON.stringify(localSettings))
    }
  }, [localSettings])

  const handleSettingChange = async (
    setting: keyof UserSettings,
    value: boolean,
  ) => {
    setIsUpdatingVisibility(true)
    setSettings((prev) => ({ ...prev, [setting]: value }))
    if (user) {
      try {
        await updateDocument('users', user.uid, { [setting]: value })
        toast({
          title: 'Settings Updated',
          description: `Your ${setting} has been updated successfully.`,
          duration: 3000,
        })
      } catch (error) {
        console.error('Error updating user settings:', error)
        toast({
          title: 'Error',
          description: 'Failed to update settings. Please try again.',
          duration: 3000,
        })
        setSettings((prev) => ({ ...prev, [setting]: !value }))
      } finally {
        setIsUpdatingVisibility(false)
      }
    } else {
      setIsUpdatingVisibility(false)
    }
  }

  const handleLocalSettingChange = (
    setting: keyof LocalSettings,
    value: boolean | number,
  ) => {
    const newLocalSettings = { ...localSettings, [setting]: value }
    setLocalSettings(newLocalSettings)
    if (typeof window !== 'undefined') {
      localStorage.setItem('localSettings', JSON.stringify(newLocalSettings))
      window.dispatchEvent(new Event('localSettingsChanged'))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] bg-gray-900 text-orange-200 border-2 border-orange-500 rounded-lg shadow-lg shadow-orange-500/20">
        <DialogHeader>
          <DialogTitle className="text-3xl font-halloween text-orange-500 flex items-center justify-center">
            <motion.div
              animate={{ rotate: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <FaGhost className="mr-2 h-8 w-8" />
            </motion.div>
            Spooky Settings
            <motion.div
              animate={{ rotate: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            >
              <GiSpiderWeb className="ml-2 h-8 w-8" />
            </motion.div>
          </DialogTitle>
          <DialogDescription className="text-center text-orange-300">
            Customize your haunted experience
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="general" className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800 rounded-lg gap-1">
            <TabsTrigger
              value="general"
              className="text-orange-200 data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-l-lg"
            >
              <FaUser className="mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="text-orange-200 data-[state=active]:bg-orange-500 data-[state=active]:text-white"
            >
              <FaBell className="mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger
              value="local"
              className="text-orange-200 data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-r-lg"
            >
              <FaCog className="mr-2" />
              Local
            </TabsTrigger>
          </TabsList>
          <TabsContent value="general">
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4 mt-4"
              >
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="profileVisibility"
                    className="text-orange-300 flex items-center"
                  >
                    <FaEye className="mr-2" />
                    Profile Visibility
                  </Label>
                  <Switch
                    id="profileVisibility"
                    checked
                    /*checked={settings.profileVisibility}
                    onCheckedChange={(checked) =>
                      handleSettingChange('profileVisibility', checked)
                    }
                    disabled={isUpdatingVisibility}*/
                    disabled
                  />
                </div>
                <p className="text-sm text-orange-200">
                  Your profile is visible to other users. You can&apos;t change
                  this yet
                </p>
              </motion.div>
            </AnimatePresence>
          </TabsContent>
          <TabsContent value="notifications">
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4 mt-4"
              >
                <div className="opacity-50 pointer-events-none">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="notificationsEnabled"
                      className="text-orange-300 flex items-center"
                    >
                      <GiPumpkin className="mr-2" />
                      Enable Notifications
                    </Label>
                    <Switch id="notificationsEnabled" checked={false} />
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <Label
                      htmlFor="emailNotifications"
                      className="text-orange-300 flex items-center"
                    >
                      <FaEnvelope className="mr-2" />
                      Email Notifications
                    </Label>
                    <Switch id="emailNotifications" checked={false} />
                  </div>
                </div>
                <p className="text-sm text-orange-400 italic mt-4">
                  Notifications coming soon! The ghosts are still learning how
                  to whisper...
                </p>
              </motion.div>
            </AnimatePresence>
          </TabsContent>
          <TabsContent value="local">
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4 mt-4"
              >
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="disableBackgroundImage"
                    className="text-orange-300 flex items-center"
                  >
                    <FaImage className="mr-2" />
                    Disable Background Image
                  </Label>
                  <Switch
                    id="disableBackgroundImage"
                    checked={localSettings.disableBackgroundImage}
                    onCheckedChange={(checked) =>
                      handleLocalSettingChange(
                        'disableBackgroundImage',
                        checked,
                      )
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="disableMusicPlayerAnimations"
                    className="text-orange-300 flex items-center"
                  >
                    <GiMusicalNotes className="mr-2" />
                    Disable Music Player Animations
                  </Label>
                  <Switch
                    id="disableMusicPlayerAnimations"
                    checked={localSettings.disableMusicPlayerAnimations}
                    onCheckedChange={(checked) =>
                      handleLocalSettingChange(
                        'disableMusicPlayerAnimations',
                        checked,
                      )
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="disableChatBackgroundAnimations"
                    className="text-orange-300 flex items-center"
                  >
                    <FaGhost className="mr-2" />
                    Disable Chat Background Animations
                  </Label>
                  <Switch
                    id="disableChatBackgroundAnimations"
                    checked={localSettings.disableChatBackgroundAnimations}
                    onCheckedChange={(checked) =>
                      handleLocalSettingChange(
                        'disableChatBackgroundAnimations',
                        checked,
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="musicPlayerVolume"
                    className="text-orange-300 flex items-center"
                  >
                    <FaVolumeUp className="mr-2" />
                    Default Music Player Volume
                  </Label>
                  <Slider
                    id="musicPlayerVolume"
                    min={0}
                    max={100}
                    step={1}
                    value={[localSettings.musicPlayerVolume]}
                    onValueChange={(value) =>
                      handleLocalSettingChange('musicPlayerVolume', value[0])
                    }
                    className="w-full"
                  />
                  <div className="text-sm text-orange-200 text-right">
                    {localSettings.musicPlayerVolume}%
                  </div>
                </div>
                <p className="text-sm text-orange-200">
                  These settings are saved locally and will not sync across
                  devices. Restart the website to see the changes.
                </p>
              </motion.div>
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
