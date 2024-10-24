'use client'

import React from 'react'
import Image from 'next/image'

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
  FaXTwitter,
  FaTwitter,
  FaHeart,
  FaCalendar,
  FaTrophy,
} from 'react-icons/fa6'

interface AboutModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  const appInfo = {
    name: 'SpookLens',
    version: '0.1.0 - Beta',
    description: 'A Halloween-themed social media app!',
    creator: {
      name: 'Pavloh',
      twitter: 'impavloh',
      github: 'impavloh',
    },
    hackathon: {
      name: 'Cloudinary CloudCreate: Spooky AI Hackathon',
      date: 'October 8 - 22, 2024',
      organizer: 'MiduDev x Cloudinary',
    },
    finalist: {
      status: true,
      message: 'Finalist in the Cloudinary CloudCreate: Spooky AI Hackathon!',
    },
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        closeOnOutsideClick={true}
        className="sm:max-w-[425px] bg-gray-900 text-orange-200 border-2 border-orange-500 rounded-lg shadow-lg shadow-orange-500/20"
      >
        <DialogHeader>
          <DialogTitle className="text-3xl font-halloween text-orange-500 flex items-center justify-center">
            <Image
              src="/images/logo2.png"
              alt="SpookLens"
              width={40}
              height={40}
            />
            {appInfo.name}
          </DialogTitle>
          <DialogDescription className="text-orange-200 text-center">
            Version {appInfo.version}
          </DialogDescription>
        </DialogHeader>
        <Separator className="bg-orange-500/50" />
        <div className="space-y-4">
          <motion.p
            className="text-sm text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {appInfo.description}
          </motion.p>
          {appInfo.finalist.status && (
            <motion.div
              className="flex flex-col items-center space-y-2"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 25 }}
            >
              <Badge
                variant="secondary"
                className="bg-yellow-500/20 text-yellow-300 flex items-center space-x-2"
              >
                <FaTrophy className="text-yellow-400" />
                <span>Finalist Project</span>
              </Badge>
              <p className="text-sm text-center text-yellow-200">{appInfo.finalist.message}</p>
            </motion.div>
          )}
          <motion.div
            className="flex flex-col items-center space-y-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Badge
              variant="secondary"
              className="bg-orange-500/20 text-orange-300"
            >
              {appInfo.hackathon.name}
            </Badge>
            <div className="flex items-center space-x-2 text-sm">
              <FaCalendar className="h-4 w-4 text-orange-400" />
              <span>{appInfo.hackathon.date}</span>
            </div>
            <span className="text-xs text-orange-300">
              Organized by {appInfo.hackathon.organizer}
            </span>
          </motion.div>
        </div>
        <Separator className="bg-orange-500/50" />
        <div className="space-y-4">
          <motion.div
            className="flex items-center justify-center space-x-2"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <FaHeart className="text-red-500" />
            <span>Created by {appInfo.creator.name}</span>
          </motion.div>
          <div className="flex space-x-2">
            <Button
              asChild
              size="sm"
              className="flex-1 bg-transparent border-orange-500 text-orange-300 hover:bg-orange-500/20"
            >
              <a
                href={`https://twitter.com/${appInfo.creator.twitter}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaTwitter className="mr-2 h-4 w-4" />
                Twitter
                <FaXTwitter className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button
              asChild
              size="sm"
              className="flex-1 bg-transparent border-orange-500 text-orange-300 hover:bg-orange-500/20"
            >
              <a
                href={`https://github.com/${appInfo.creator.github}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaGithub className="mr-2 h-4 w-4" />
                GitHub
              </a>
            </Button>
          </div>
          <Separator className="bg-orange-500/20" />
          <p className="text-orange-200 text-xs text-center">
            User avatars designed by{' '}
            <a
              href="https://www.freepik.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-block"
            >
              Freepik
              <span className="absolute left-0 bottom-0 w-full h-px bg-orange-200 transform scale-x-0 transition-transform duration-300 ease-in-out group-hover:scale-x-100"></span>
            </a>
            <br />
            Music by{' '}
            <a
              href="https://www.pixabay.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-block"
            >
              Pixabay
              <span className="absolute left-0 bottom-0 w-full h-px bg-orange-200 transform scale-x-0 transition-transform duration-300 ease-in-out group-hover:scale-x-100"></span>
            </a>
          </p>
        </div>
        <div>
          <Button
            onClick={onClose}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white transition-colors duration-200"
          >
            Close
          </Button>
        </div>
        <motion.div
          className="absolute top-2 right-2"
          initial={{ opacity: 0, rotate: -90 }}
          animate={{ opacity: 1, rotate: 0 }}
          transition={{
            delay: 0.5,
            type: 'spring',
            stiffness: 260,
            damping: 20,
          }}
        ></motion.div>
      </DialogContent>
    </Dialog>
  )
}