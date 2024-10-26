'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

import { motion } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  FaGithub,
  FaTwitter,
  FaHeart,
  FaCalendar,
  FaTrophy,
  FaCode,
} from 'react-icons/fa6'

interface AboutModalProps {
  isOpen: boolean
  onClose: () => void
}

const appInfo = {
  name: 'SpookLens',
  version: '0.1.1 - Beta',
  description: 'A Halloween-themed social media app with AI-powered features!',
  creator: {
    name: 'Pavloh',
    twitter: 'impavloh',
    github: 'impavloh',
  },
  hackathon: {
    name: 'Cloudinary Spooky AI Creations Hackathon',
    date: 'October 8 - 22, 2024',
    organizer: 'MiduDev x Cloudinary',
  },
  repository: 'https://github.com/impavloh/spooklens',
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] w-[95vw] max-h-[90vh] overflow-y-auto bg-gradient-to-b from-gray-900 to-gray-800 text-orange-200 border-2 border-orange-500 rounded-lg shadow-lg shadow-orange-500/20">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-3xl sm:text-4xl font-halloween text-orange-500 flex items-center justify-center gap-2">
            <Image
              src="/images/logo2.png"
              alt="SpookLens logo"
              width={50}
              height={50}
              className="animate-pulse"
            />
            <span className="break-all">{appInfo.name}</span>
          </DialogTitle>
          <DialogDescription className="text-orange-200 text-center text-base sm:text-lg">
            Version {appInfo.version}
          </DialogDescription>
        </DialogHeader>
        <Separator className="bg-orange-500/50" />
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-sm sm:text-base text-center">
            {appInfo.description}
          </p>

          <motion.div
            className="flex flex-col items-center space-y-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Badge
              variant="secondary"
              className="bg-orange-500/20 text-orange-300 text-sm sm:text-base text-center px-2"
            >
              {appInfo.hackathon.name}
            </Badge>
            <Badge
              variant="secondary"
              className="bg-yellow-500/20 text-yellow-300 flex items-center space-x-2 text-sm sm:text-base px-2"
            >
              <FaTrophy className="text-yellow-400 mr-2" aria-hidden="true" />
              <span>Finalist Project</span>
            </Badge>
            <div className="flex items-center space-x-2 text-sm sm:text-base">
              <FaCalendar
                className="h-4 w-4 sm:h-5 sm:w-5 text-orange-400"
                aria-hidden="true"
              />
              <span>{appInfo.hackathon.date}</span>
            </div>
            <span className="text-sm text-orange-300 text-center">
              Organized by {appInfo.hackathon.organizer}
            </span>
          </motion.div>
        </motion.div>
        <Separator className="bg-orange-500/50" />
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className="flex items-center justify-center space-x-2 text-sm sm:text-base">
            <FaHeart className="text-red-500" aria-hidden="true" />
            <span>Created by {appInfo.creator.name}</span>
          </div>
          <div className="flex justify-center items-center gap-2 w-full">
            <Button
              asChild
              size="icon"
              variant="outline"
              className="bg-transparent border-orange-500 text-orange-300 hover:bg-orange-500/20 transition-colors duration-200"
            >
              <Link
                href={`https://twitter.com/${appInfo.creator.twitter}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${appInfo.creator.name}'s Twitter profile`}
              >
                <FaTwitter className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="flex-1 max-w-[200px] bg-transparent border-orange-500 text-orange-300 hover:bg-orange-500/20 transition-colors duration-200"
            >
              <Link
                href={appInfo.repository}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaCode className="h-4 w-4 mr-2" aria-hidden="true" />
                <span className="truncate">SpookLens Repository</span>
              </Link>
            </Button>
            <Button
              asChild
              size="icon"
              variant="outline"
              className="bg-transparent border-orange-500 text-orange-300 hover:bg-orange-500/20 transition-colors duration-200"
            >
              <Link
                href={`https://github.com/${appInfo.creator.github}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${appInfo.creator.name}'s GitHub profile`}
              >
                <FaGithub className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </motion.div>
        <Separator className="bg-orange-500/50" />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <p className="text-orange-200 text-xs sm:text-sm text-center">
            User avatars designed by{' '}
            <Link
              href="https://www.freepik.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-orange-400 transition-colors"
            >
              Freepik
            </Link>
            <br />
            Music by{' '}
            <Link
              href="https://www.pixabay.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-orange-400 transition-colors"
            >
              Pixabay
            </Link>
          </p>
        </motion.div>
        <Button
          onClick={onClose}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white transition-colors duration-200 text-base"
        >
          Close
        </Button>
      </DialogContent>
    </Dialog>
  )
}
