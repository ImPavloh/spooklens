'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

import BackgroundAnimation from '@/components/extras/BackgroundAnimation'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FaTrophy, FaCandyCane, FaMedal } from 'react-icons/fa'
import { GiPumpkin, GiBat } from 'react-icons/gi'

import { db } from '@/lib/firebase'
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'

interface LeaderboardEntry {
  id: string
  username: string
  avatar: string
  candies: number
  spins: number
  rank: number
}

const leaderboardCategories = [
  { id: 'candies', name: 'Top Candies', icon: FaCandyCane },
  { id: 'spins', name: 'Top Spins', icon: GiPumpkin },
]

interface LocalSettings {
  disableBackgroundImage: boolean
}

export default function ImprovedLeaderboardPage() {
  const [leaderboardData, setLeaderboardData] = useState<{
    [key: string]: LeaderboardEntry[]
  }>({})
  const [isLoading, setIsLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('candies')
  const [hoveredEntry, setHoveredEntry] = useState<string | null>(null)
  const [localSettings] = useState<LocalSettings>(() => {
    const savedSettings = localStorage.getItem('localSettings')
    return savedSettings
      ? JSON.parse(savedSettings)
      : {
          disableBackgroundImage: false,
        }
  })

  useEffect(() => {
    localStorage.setItem('localSettings', JSON.stringify(localSettings))
  }, [localSettings])

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      setIsLoading(true)
      const data: { [key: string]: LeaderboardEntry[] } = {}

      for (const category of leaderboardCategories) {
        const q = query(
          collection(db, 'users'),
          orderBy(
            category.id === 'candies' ? 'totalCandies' : 'totalSpins',
            'desc',
          ),
          limit(100),
        )
        const querySnapshot = await getDocs(q)
        data[category.id] = querySnapshot.docs.map((doc, index) => ({
          id: doc.id,
          username: doc.data().username,
          avatar: doc.data().avatar,
          candies: doc.data().totalCandies || 0,
          spins: doc.data().totalSpins || 0,
          rank: index + 1,
        }))
      }

      setLeaderboardData(data)
      setIsLoading(false)
    }

    fetchLeaderboardData()
  }, [])

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <FaTrophy className="text-yellow-400 h-8 w-8" />
      case 2:
        return <FaMedal className="text-gray-400 h-7 w-7" />
      case 3:
        return <FaMedal className="text-orange-400 h-6 w-6" />
      default:
        return <FaCandyCane className="text-orange-200 h-5 w-5" />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-24 flex flex-col bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 text-orange-200 overflow-hidden pb-8 relative"
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
            className="mb-2 p-2 text-5xl lg:text-6xl font-extrabold tracking-wider text-center  text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-purple-600 animate-gradient-x drop-shadow-[0_5px_3px_rgba(0,0,0,0.4)]"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Spooky Leaderboard
          </motion.h1>
          <motion.p
            className="mb-4 text-center text-xl lg:text-2xl text-orange-300"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            See who is haunting the top spots in our spine-chilling competition!
          </motion.p>

          <Card className="h-[600px] bg-gradient-to-br from-[#1a1a1d] to-[#2c003e] border-orange-500 text-orange-200 overflow-hidden rounded-2xl shadow-2xl shadow-orange-500/30 transition-shadow duration-300">
            <CardContent className="p-6">
              <Tabs
                value={activeCategory}
                onValueChange={setActiveCategory}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 bg-gray-800/50 backdrop-blur-sm rounded-full p-1 gap-2 mb-8">
                  {leaderboardCategories.map((category) => (
                    <TabsTrigger
                      key={category.id}
                      value={category.id}
                      className="rounded-full data-[state=active]:bg-orange-500 data-[state=active]:text-white transition-all duration-300"
                    >
                      <category.icon className="mr-2 h-5 w-5" />
                      {category.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {leaderboardCategories.map((category) => (
                  <TabsContent key={category.id} value={category.id}>
                    <ScrollArea className="h-[450px] pr-4">
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
                              <GiBat className="text-orange-500 h-16 w-16" />
                            </motion.div>
                          </motion.div>
                        ) : (
                          leaderboardData[category.id]?.map((entry, index) => (
                            <motion.div
                              key={entry.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ delay: index * 0.05 }}
                              onMouseEnter={() => setHoveredEntry(entry.id)}
                              onMouseLeave={() => setHoveredEntry(null)}
                            >
                              <div className="mb-4 p-4 rounded-xl bg-purple-900/50 hover:bg-purple-800/50 transition-all duration-300 border border-orange-500/30 flex items-center gap-4 group relative overflow-hidden">
                                <div className="flex-shrink-0 w-12 text-center">
                                  {getPositionIcon(index + 1)}
                                </div>
                                <div className="flex-shrink-0 w-16 h-16 rounded-full overflow-hidden border-2 border-orange-500 transition-transform duration-300 group-hover:scale-110">
                                  <Image
                                    src={entry.avatar || '/placeholder.svg'}
                                    alt={entry.username}
                                    width={64}
                                    height={64}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex-grow">
                                  <h3 className="font-semibold text-orange-300 text-xl group-hover:text-orange-400 transition-colors duration-300">
                                    <Link
                                      href="/user/[username]"
                                      as={`/user/${entry.username}`}
                                    >
                                      {entry.username}
                                    </Link>
                                  </h3>
                                  <p className="text-sm text-orange-200 group-hover:text-orange-300 transition-colors duration-300">
                                    {category.id === 'candies'
                                      ? 'Candies'
                                      : 'Spins'}
                                    :{' '}
                                    <span className="font-bold text-lg">
                                      {category.id === 'candies'
                                        ? entry.candies
                                        : entry.spins}
                                    </span>
                                  </p>
                                </div>
                                <div className="flex-shrink-0 w-12 text-right">
                                  <span className="text-2xl font-bold text-orange-400 group-hover:text-orange-500 transition-colors duration-300">
                                    #{index + 1}
                                  </span>
                                </div>
                                <motion.div
                                  initial={{ x: '100%' }}
                                  animate={{
                                    x: hoveredEntry === entry.id ? 0 : '100%',
                                  }}
                                  transition={{
                                    type: 'spring',
                                    stiffness: 100,
                                    damping: 15,
                                  }}
                                  className="absolute right-0 top-0 bottom-0 w-1/3 bg-orange-500 flex items-center justify-center"
                                >
                                  <div className="text-gray-900 font-bold text-center">
                                    <p className="text-2xl">
                                      {category.id === 'candies'
                                        ? entry.spins
                                        : entry.candies}
                                    </p>
                                    <p className="text-sm">
                                      {category.id === 'candies'
                                        ? 'Spins'
                                        : 'Candies'}
                                    </p>
                                  </div>
                                </motion.div>
                              </div>
                            </motion.div>
                          ))
                        )}
                      </AnimatePresence>
                    </ScrollArea>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
      <p className="mt-8 text-center text-orange-300 z-10">
        Stay spooky and keep collecting those candies!
      </p>
    </motion.div>
  )
}
