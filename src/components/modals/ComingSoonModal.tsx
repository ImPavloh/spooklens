'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

import { FaEye, FaHome, FaComments } from 'react-icons/fa'
import { GiCandleSkull, GiPumpkin } from 'react-icons/gi'

interface ComingSoonModalProps {
  isOpen: boolean
  onClose: () => void
  page: 'store' | 'chats'
}

export default function ComingSoonModal({
  isOpen,
  onClose,
  page,
}: ComingSoonModalProps) {
  const router = useRouter()

  const getModalContent = () => {
    switch (page) {
      case 'store':
        return {
          icon: (
            <GiCandleSkull className="text-5xl sm:text-6xl text-orange-500" />
          ),
          title: 'Store Coming Soon!',
          description:
            'Our spectral shopkeepers are still brewing up the Spooky Candy Store. Dare to peek inside, or haunt us again later for a spine-chilling shopping spree!',
          primaryButton: {
            text: 'Sneak a Peek',
            icon: <FaEye className="mr-2" />,
            action: () => onClose(),
          },
          secondaryButton: {
            text: 'Return Home',
            icon: <FaHome className="mr-2" />,
            action: () => router.push('/'),
          },
        }
      case 'chats':
        return {
          icon: <FaComments className="text-5xl sm:text-6xl text-orange-500" />,
          title: 'Chats Coming Soon!',
          description:
            'Our phantom programmers are setting up the haunted chat rooms. For now, you can join the Global Haunted Chat!',
          primaryButton: {
            text: 'Join Global Chat',
            icon: <GiPumpkin className="mr-2" />,
            action: () => router.push('/home'),
          },
        }
      default:
        return null
    }
  }

  const content = getModalContent()

  if (!content) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose} modal={true}>
          <DialogContent
            hideCloseButton={true}
            className="max-w-[90vw] md:max-w-[500px] bg-gradient-to-br from-gray-900 to-purple-900 text-orange-200 border-2 border-orange-500 p-4 sm:p-8 rounded-lg shadow-2xl"
          >
            <DialogHeader>
              <DialogTitle className="text-3xl sm:text-4xl font-halloween text-orange-500 flex items-center justify-center mb-2 sm:mb-4">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {content.icon}
                </motion.div>
              </DialogTitle>
            </DialogHeader>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="mt-2 sm:mt-4 text-center"
            >
              <h2 className="text-2xl sm:text-4xl font-halloween text-orange-500 mb-2 sm:mb-4 animate-pulse">
                {content.title}
              </h2>
              <p className="text-base sm:text-xl text-orange-300 mb-4 sm:mb-6">
                {content.description}
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4">
                <Button
                  onClick={content.primaryButton.action}
                  className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 sm:px-6 rounded-full text-base sm:text-lg font-semibold shadow-md shadow-purple-500/25 transition-all duration-300 hover:animate-pulse flex items-center justify-center"
                >
                  {content.primaryButton.icon}
                  {content.primaryButton.text}
                </Button>
                {content.secondaryButton && (
                  <Button
                    onClick={content.secondaryButton.action}
                    className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 sm:px-6 rounded-full text-base sm:text-lg font-semibold shadow-md shadow-orange-500/25 transition-all duration-300 hover:animate-pulse flex items-center justify-center"
                  >
                    {content.secondaryButton.icon}
                    {content.secondaryButton.text}
                  </Button>
                )}
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  )
}
