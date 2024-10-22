// no disponible actuamente
'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FaSpider, FaSearch, FaGhost } from 'react-icons/fa'
import { GiBat, GiPumpkin, GiCauldron, GiSpiderWeb } from 'react-icons/gi'
import { db, auth } from '@/lib/firebase'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'

const ComingSoonModal = dynamic(
  () => import('@/components/modals/ComingSoonModal'),
  { ssr: false },
)

interface Chat {
  id: string
  participants: string[]
  lastMessage: string
  lastMessageTime: number
}

const chatIcons = [FaGhost, GiBat, GiPumpkin, GiCauldron]

export default function ImprovedChatsPage() {
  const [chats, setChats] = useState<Chat[]>([])
  const [filteredChats, setFilteredChats] = useState<Chat[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [showComingSoon, setShowComingSoon] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchChats = async () => {
      if (!auth.currentUser) return

      setIsLoading(true)
      const q = query(
        collection(db, 'chats'),
        where('participants', 'array-contains', auth.currentUser.email),
        orderBy('lastMessageTime', 'desc'),
      )

      const querySnapshot = await getDocs(q)
      const fetchedChats: Chat[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Chat, 'id'>),
      }))

      setChats(fetchedChats)
      setFilteredChats(fetchedChats)
      setIsLoading(false)
    }

    fetchChats()
  }, [])

  useEffect(() => {
    const filtered = chats.filter((chat) =>
      chat.participants.some((participant) =>
        participant.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    )
    setFilteredChats(filtered)
  }, [searchTerm, chats])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  return (
    <motion.div
      initial={{ opacity: 0.2 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 text-orange-200 overflow-hidden pt-24 relative"
    >
      <main className="flex-grow flex flex-col items-center px-4 lg:px-0 relative">
        <div className="relative z-10 w-full max-w-4xl py-8">
          <motion.h1
            className="mb-6 text-4xl lg:text-5xl font-extrabold tracking-wide text-center text-orange-500 relative"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <motion.span
              className="absolute -left-8 -top-0"
              animate={{ y: [0, -5, 0], rotate: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <FaSpider
                className="h-8 w-8 text-orange-500 animate-pulse"
                aria-hidden="true"
              />
            </motion.span>
            <motion.span
              className="absolute -right-8 -bottom-8"
              animate={{ y: [0, 5, 0], rotate: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            >
              <GiSpiderWeb
                className="h-8 w-8 text-orange-500 animate-pulse"
                aria-hidden="true"
              />
            </motion.span>
            Spooky Chats
          </motion.h1>
          <motion.p
            className="mb-8 text-center text-lg lg:text-xl text-orange-300"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Engage in haunting conversations with fellow spirits!
          </motion.p>

          <Card className="bg-gradient-to-br from-[#1a1a1d] to-[#2c003e] border-orange-500 text-orange-200 overflow-hidden rounded-lg shadow-xl shadow-orange-500/20 transition-shadow duration-300">
            <CardHeader className="p-4 border-b border-orange-500/30">
              <CardTitle className="text-3xl font-halloween text-orange-500 animate-flicker text-center">
                Your Haunted Conversations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="mb-4 flex items-center">
                <Input
                  type="text"
                  placeholder="Search chats..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="flex-grow mr-2 bg-purple-900/50 border-orange-500 text-orange-200 placeholder-orange-300"
                />
                <FaSearch
                  className="text-orange-400 h-5 w-5 animate-pulse"
                  aria-hidden="true"
                />
              </div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mb-4"
              >
                <Button
                  onClick={() => router.push('/chat/global-chat')}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-halloween text-lg py-6 rounded-lg shadow-lg shadow-orange-500/30 transition-all duration-300"
                >
                  <GiBat
                    className="mr-2 h-6 w-6 animate-bounce"
                    aria-hidden="true"
                  />
                  Join Global Haunted Chat
                </Button>
              </motion.div>
              <ScrollArea className="h-[400px] pr-4">
                <AnimatePresence>
                  {isLoading ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex justify-center items-center h-full"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                      >
                        <GiBat className="text-orange-500 h-12 w-12" />
                      </motion.div>
                    </motion.div>
                  ) : filteredChats.length === 0 ? (
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center text-orange-300 font-halloween text-xl"
                    >
                      No spooky chats found. Start a new haunting conversation!
                    </motion.p>
                  ) : (
                    filteredChats.map((chat, index) => (
                      <motion.div
                        key={chat.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Link href={`/chat/${chat.id}`}>
                          <motion.div
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="mb-4 p-4 rounded-lg bg-purple-900/50 hover:bg-purple-800/50 transition-colors border border-orange-500/30 flex items-center gap-4"
                          >
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                              {React.createElement(
                                chatIcons[index % chatIcons.length],
                                {
                                  className: 'h-6 w-6 text-orange-500',
                                },
                              )}
                            </div>
                            <div className="flex-grow">
                              <h3 className="font-semibold text-orange-300 text-lg">
                                {chat.participants
                                  .filter((p) => p !== auth.currentUser?.email)
                                  .join(', ')}
                              </h3>
                              <p className="text-sm text-orange-200 mt-1">
                                {chat.lastMessage}
                              </p>
                            </div>
                            <div className="flex-shrink-0 text-right">
                              <span className="text-xs text-orange-400">
                                {new Date(
                                  chat.lastMessageTime,
                                ).toLocaleString()}
                              </span>
                            </div>
                          </motion.div>
                        </Link>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </main>
      <ComingSoonModal
        isOpen={showComingSoon}
        onClose={() => setShowComingSoon(false)}
        page="chats"
      />
    </motion.div>
  )
}
