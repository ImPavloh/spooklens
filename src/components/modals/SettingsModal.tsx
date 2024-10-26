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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('localSettings', JSON.stringify(localSettings))
    }
  }, [localSettings])

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
      <DialogContent className="sm:max-w-[450px] w-[95vw] max-h-[90vh] overflow-y-auto bg-gray-900 text-orange-200 border-2 border-orange-500 rounded-lg shadow-lg shadow-orange-500/20">
        <DialogHeader>
          <DialogTitle className="text-2xl sm:text-3xl font-halloween text-orange-500 flex items-center justify-center">
            <motion.div
              animate={{ rotate: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <FaGhost className="mr-2 h-6 w-6 sm:h-8 sm:w-8" />
            </motion.div>
            Spooky Settings
            <motion.div
              animate={{ rotate: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            >
              <GiSpiderWeb className="ml-2 h-6 w-6 sm:h-8 sm:w-8" />
            </motion.div>
          </DialogTitle>
          <DialogDescription className="text-center text-orange-300 text-sm sm:text-base">
            Customize your haunted experience
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="general" className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800 rounded-lg gap-1">
            <TabsTrigger
              value="general"
              className="text-orange-200 data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-l-lg text-xs sm:text-sm"
            >
              <FaUser className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">General</span>
              <span className="sm:hidden">Gen</span>
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="text-orange-200 data-[state=active]:bg-orange-500 data-[state=active]:text-white text-xs sm:text-sm"
            >
              <FaBell className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Notifications</span>
              <span className="sm:hidden">Notif</span>
            </TabsTrigger>
            <TabsTrigger
              value="local"
              className="text-orange-200 data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-r-lg text-xs sm:text-sm"
            >
              <FaCog className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
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
                    className="text-orange-300 flex items-center text-sm sm:text-base"
                  >
                    <FaEye className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    Profile Visibility
                  </Label>
                  <Switch id="profileVisibility" checked disabled />
                </div>
                <p className="text-xs sm:text-sm text-orange-200">
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
                      className="text-orange-300 flex items-center text-sm sm:text-base"
                    >
                      <GiPumpkin className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                      Enable Notifications
                    </Label>
                    <Switch id="notificationsEnabled" checked={false} />
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <Label
                      htmlFor="emailNotifications"
                      className="text-orange-300 flex items-center text-sm sm:text-base"
                    >
                      <FaEnvelope className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                      Email Notifications
                    </Label>
                    <Switch id="emailNotifications" checked={false} />
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-orange-400 italic mt-4">
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
                    className="text-orange-300 flex items-center text-sm sm:text-base"
                  >
                    <FaImage className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
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
                    className="text-orange-300 flex items-center text-sm sm:text-base"
                  >
                    <GiMusicalNotes className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
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
                    className="text-orange-300 flex items-center text-sm sm:text-base"
                  >
                    <FaGhost className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
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
                    className="text-orange-300 flex items-center text-sm sm:text-base"
                  >
                    <FaVolumeUp className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
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
                  <div className="text-xs sm:text-sm text-orange-200 text-right">
                    {localSettings.musicPlayerVolume}%
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-orange-200">
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
