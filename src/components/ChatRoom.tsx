'use client'

import { useState, useEffect, useRef, useCallback, memo } from 'react'
import Image from 'next/image'
import Link from 'next/link'

import { motion, AnimatePresence } from 'framer-motion'

import { useChatFilter } from '@/utils/ChatFilter'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { IoReload, IoSend } from 'react-icons/io5'
import { FaSpider, FaGhost, FaSmile } from 'react-icons/fa'
import { GiBat, GiSpiderWeb, GiPumpkin, GiCandleSkull } from 'react-icons/gi'

import EmojiPicker, { Theme } from 'emoji-picker-react'

import { db, auth } from '@/lib/firebase'
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  getDoc,
  doc,
  limit,
  where,
  getDocs,
} from 'firebase/firestore'

interface Message {
  id: string
  text: string
  sender: string
  createdAt: {
    seconds: number
    nanoseconds: number
  }
  username: string
  avatar: string
}

interface ChatRoomProps {
  username: string
  openAuthModal: () => void
  localSettings: {
    disableChatBackgroundAnimations: boolean
  }
  isPrivateChat?: boolean
}

const MemoizedMessageBubble = memo(
  ({
    message,
    isCurrentUser,
    index,
  }: {
    message: Message
    isCurrentUser: boolean
    index: number
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.8 }}
      transition={{
        type: 'spring',
        stiffness: 500,
        damping: 30,
        mass: 1,
        delay: index * 0.05,
      }}
      className={`flex flex-col pt-4 max-w-[80%] ${
        isCurrentUser ? 'ml-auto items-end' : 'items-start'
      }`}
    >
      <motion.div
        className="flex items-start"
        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
      >
        {!isCurrentUser && (
          <MessageAvatar username={message.username} avatar={message.avatar} />
        )}
        <motion.div
          className={`rounded-lg px-4 py-2 ${
            isCurrentUser
              ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
              : 'bg-gradient-to-r from-gray-700 to-gray-800 text-orange-200'
          } shadow-lg`}
          whileHover={{ boxShadow: '0px 0px 8px rgba(255,165,0,0.5)' }}
        >
          <p className="font-semibold font-halloween mb-1">
            {isCurrentUser ? 'You' : message.username}
          </p>
          <p className="text-sm">{message.text}</p>
        </motion.div>
        {isCurrentUser && (
          <MessageAvatar username={message.username} avatar={message.avatar} />
        )}
      </motion.div>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className={`text-xs mt-1 mx-14 text-orange-300 ${
          isCurrentUser ? 'text-right' : 'text-left'
        }`}
      >
        {new Date(message.createdAt.seconds * 1000).toLocaleTimeString()}
      </motion.span>
    </motion.div>
  ),
)

MemoizedMessageBubble.displayName = 'MemoizedMessageBubble'

const MessageAvatar = memo(
  ({ username, avatar }: { username: string; avatar: string }) => (
    <Link href={`/user/${username}`} target="_blank" rel="noopener noreferrer">
      <motion.div
        className="mx-2 cursor-pointer"
        whileHover={{ scale: 1.2, rotate: 360 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <Avatar className="border-2 border-orange-500">
          <AvatarImage src={avatar} alt={username} />
          <AvatarFallback>
            <FaGhost
              className="text-orange-500"
              aria-label={`${username}'s avatar`}
            />
          </AvatarFallback>
        </Avatar>
      </motion.div>
    </Link>
  ),
)

MessageAvatar.displayName = 'MessageAvatar'

export default function ChatRoom({
  username,
  openAuthModal,
  localSettings,
  isPrivateChat = false,
}: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [chatId, setChatId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const { filterMessage } = useChatFilter()

  const currentUser = auth.currentUser

  const handleEmojiClick = useCallback((emojiObject: { emoji: string }) => {
    setNewMessage((prevMessage) => prevMessage + emojiObject.emoji)
    setShowEmojiPicker(false)
    inputRef.current?.focus()
  }, [])

  const getChatId = useCallback(async () => {
    if (!isPrivateChat) return 'global-chat'

    if (!currentUser) {
      setError('You must be logged in to start a private chat.')
      openAuthModal()
      return null
    }

    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('username', '==', username), limit(1))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      setError('User not found.')
      return null
    }

    const otherUserId = querySnapshot.docs[0].id
    return [currentUser.uid, otherUserId].sort().join('_')
  }, [isPrivateChat, currentUser, username, openAuthModal])

  const loadMessages = useCallback(async () => {
    const id = await getChatId()
    if (!id) return

    setChatId(id)

    const collectionPath = isPrivateChat
      ? `privateChats/${id}/messages`
      : `chats/${id}/messages`
    const q = query(
      collection(db, collectionPath),
      orderBy('createdAt', 'desc'),
      limit(50),
    )

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const msgs = querySnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() } as Message))
        .reverse()
      setMessages(msgs)
      setLoading(false)
    })

    return unsubscribe
  }, [isPrivateChat, getChatId])

  useEffect(() => {
    loadMessages()
  }, [loadMessages])

  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector(
        '[data-radix-scroll-area-viewport]',
      )
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight
      }
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !currentUser || !chatId) return

    setIsSending(true)
    setError(null)

    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid))
      const userData = userDoc.data()

      const filteredMessage = filterMessage(newMessage)

      const collectionPath = isPrivateChat
        ? `privateChats/${chatId}/messages`
        : `chats/${chatId}/messages`
      await addDoc(collection(db, collectionPath), {
        text: filteredMessage,
        sender: currentUser.uid,
        createdAt: new Date(),
        username: userData?.username || 'Anonymous Ghost',
        avatar: userData?.avatar || '',
      })

      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
      setError('A dark force prevented your message. Try again.')
    } finally {
      setIsSending(false)
    }
  }

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const renderMessages = useCallback(
    () =>
      messages.length === 0 ? (
        <div className="text-center text-purple-300 mt-6">
          <motion.div
            animate={{ y: [0, -10, 0], rotateY: [0, 180, 360] }}
            transition={{ repeat: Infinity, duration: 3 }}
          >
            <Image
              src="/images/sad-logo2.png"
              alt="SpookLens"
              className="mx-auto mb-4 filter drop-shadow-[0_0_20px_rgba(255,165,0,0.7)]"
              width={160}
              height={160}
            />
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center text-orange-300 font-halloween text-lg"
          >
            No spirits have spoken yet. <br /> Be the first to break the
            silence!
          </motion.p>
        </div>
      ) : (
        <AnimatePresence>
          {messages.map((msg, index) => (
            <MemoizedMessageBubble
              key={msg.id}
              message={msg}
              isCurrentUser={msg.sender === currentUser?.uid}
              index={index}
            />
          ))}
        </AnimatePresence>
      ),
    [messages, currentUser],
  )

  const SkeletonMessage = memo(
    ({ isCurrentUser }: { isCurrentUser: boolean }) => (
      <div
        className={`flex flex-col mb-4 max-w-[80%] ${
          isCurrentUser ? 'ml-auto items-end' : 'items-start'
        }`}
      >
        <div className="flex items-start">
          {!isCurrentUser && (
            <Skeleton className="w-10 h-10 rounded-full mr-2" />
          )}
          <div
            className={`rounded-lg px-4 py-2 ${
              isCurrentUser ? 'bg-orange-500/20' : 'bg-gray-700/20'
            }`}
          >
            <Skeleton className="w-20 h-4 mb-2" />
            <Skeleton className="w-40 h-4" />
            <Skeleton className="w-32 h-4 mt-1" />
          </div>
          {isCurrentUser && (
            <Skeleton className="w-10 h-10 rounded-full ml-2" />
          )}
        </div>
        <Skeleton className="w-16 h-3 mt-1 self-end" />
      </div>
    ),
  )

  SkeletonMessage.displayName = 'SkeletonMessage'

  const renderSkeletonMessages = useCallback(
    () => (
      <>
        <SkeletonMessage isCurrentUser={false} />
        <SkeletonMessage isCurrentUser={true} />
        <SkeletonMessage isCurrentUser={false} />
        <SkeletonMessage isCurrentUser={true} />
        <SkeletonMessage isCurrentUser={false} />
      </>
    ),
    [SkeletonMessage],
  )
  return (
    <Card className="h-full w-full max-w-lg flex flex-col bg-gradient-to-br from-[#1a1a1d] to-[#2c003e] border-orange-500 shadow-xl [box-shadow:rgba(255,165,0,0.2)_-5px_5px,rgba(255,165,0,0.15)_-10px_10px,rgba(255,165,0,0.1)_-15px_15px,rgba(255,165,0,0.05)_-20px_20px,rgba(255,165,0,0.025)_-25px_25px] overflow-hidden relative">
      <CardHeader className="bg-gradient-to-r from-orange-500 to-purple-600 p-4 relative z-10">
        <CardTitle className="text-2xl font-semibold text-white flex items-center justify-center font-halloween">
          <motion.div
            animate={{ rotate: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <FaSpider className="mr-2 h-6 w-6" aria-hidden="true" />
          </motion.div>
          {isPrivateChat
            ? `Spooky Chat with ${username}`
            : 'Haunted Global Chat'}
          <motion.div
            animate={{ rotate: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
          >
            <GiSpiderWeb className="ml-2 h-6 w-6" aria-hidden="true" />
          </motion.div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden px-2 py-2 relative z-10">
        <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
          {loading ? renderSkeletonMessages() : renderMessages()}
        </ScrollArea>
      </CardContent>
      <CardFooter className="flex-none py-4 px-4 bg-gradient-to-r from-gray-800 to-gray-900 border-t border-orange-500/30 relative z-10">
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-center mb-2 font-halloween"
            role="alert"
          >
            {error}
          </motion.p>
        )}

        {currentUser?.isAnonymous || !currentUser ? (
          <motion.div
            className="flex w-full items-center justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={openAuthModal}
              className="bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white font-halloween text-lg py-6 px-8 rounded-lg shadow-lg shadow-orange-500/30 transition-all duration-300"
            >
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <FaGhost className="mr-2 h-5 w-5" />
              </motion.div>
              Sign Up / Log In to Chat
            </Button>
          </motion.div>
        ) : (
          <form
            onSubmit={sendMessage}
            className="flex w-full items-center space-x-2"
          >
            <div className="relative flex-grow">
              <Input
                variant="orange"
                ref={inputRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="w-full border-2 border-orange-500 text-orange-300 bg-gray-800 placeholder-orange-400 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 pr-10"
                placeholder="Speak to the spirits..."
                aria-label="Message input"
              />
              <Button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-transparent hover:bg-transparent p-1"
                aria-label="Toggle emoji picker"
              >
                <FaSmile className="text-orange-500 h-5 w-5" />
              </Button>
              {showEmojiPicker && (
                <motion.div
                  className="absolute bottom-full right-0 mb-2"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                  <EmojiPicker
                    theme={Theme.DARK}
                    skinTonesDisabled
                    searchDisabled
                    width={300}
                    height={400}
                    previewConfig={{
                      showPreview: false,
                    }}
                    onEmojiClick={handleEmojiClick}
                  />
                </motion.div>
              )}
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <Button
                type="submit"
                disabled={isSending}
                className="bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white rounded-lg shadow-lg shadow-orange-500/30 transition-all duration-300 relative overflow-hidden"
                aria-label={isSending ? 'Sending message' : 'Send message'}
              >
                <AnimatePresence mode="wait">
                  {isSending ? (
                    <motion.div
                      key="loader"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <IoReload
                        className="h-5 w-5 animate-spin"
                        aria-hidden="true"
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="send"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center space-x-2"
                    >
                      <IoSend className="h-5 w-5" aria-hidden="true" />
                      <motion.span
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 'auto', opacity: 1 }}
                        transition={{ delay: 0.1 }}
                      >
                        Send
                      </motion.span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
          </form>
        )}
      </CardFooter>
      {!localSettings.disableChatBackgroundAnimations && <FloatingIcons />}
    </Card>
  )
}

const FloatingIcons = memo(() => {
  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {[GiBat, GiPumpkin, GiCandleSkull].map((Icon, index) => (
        <motion.div
          key={index}
          className="absolute text-orange-500/20"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
            rotate: [0, 360],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 5 + Math.random() * 5,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        >
          <Icon size={20 + Math.random() * 30} />
        </motion.div>
      ))}
    </div>
  )
})

FloatingIcons.displayName = 'FloatingIcons'
