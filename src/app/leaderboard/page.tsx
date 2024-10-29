'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'

import BackgroundAnimation from '@/components/extras/BackgroundAnimation'

import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  FaTrophy,
  FaCandyCane,
  FaMedal,
  FaSearch,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaUserCircle,
} from 'react-icons/fa'
import { GiPumpkin } from 'react-icons/gi'

import { db } from '@/lib/firebase'
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'

import { useLanguage } from '@/utils/LanguageContext'

interface LeaderboardEntry {
  id: string
  username: string
  avatar: string
  candies: number
  spins: number
  rank: number
}

interface LocalSettings {
  disableBackgroundImage: boolean
}

export default function Leaderboard() {
  const { language, translations } = useLanguage()
  const t = translations[language].leaderboard

  const leaderboardCategories = useMemo(
    () => [
      { id: 'candies', name: t.categories.candies, icon: FaCandyCane },
      { id: 'spins', name: t.categories.spins, icon: GiPumpkin },
    ],
    [t.categories.candies, t.categories.spins],
  )

  const [leaderboardData, setLeaderboardData] = useState<{
    [key: string]: LeaderboardEntry[]
  }>({})
  const [isLoading, setIsLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('candies')
  const [hoveredEntry, setHoveredEntry] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState<{
    key: keyof LeaderboardEntry
    direction: 'asc' | 'desc'
  }>({
    key: 'rank',
    direction: 'asc',
  })
  const [viewMode] = useState<'compact' | 'detailed'>('detailed')
  const [userRank] = useState<LeaderboardEntry | null>(null)
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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('localSettings', JSON.stringify(localSettings))
    }
  }, [localSettings])

  const fetchLeaderboardData = useCallback(async () => {
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
  }, [leaderboardCategories])

  useEffect(() => {
    fetchLeaderboardData()
  }, [fetchLeaderboardData])

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <FaTrophy className="text-yellow-400 h-6 w-6 sm:h-8 sm:w-8" />
      case 2:
        return <FaMedal className="text-gray-400 h-5 w-5 sm:h-7 sm:w-7" />
      case 3:
        return <FaMedal className="text-orange-400 h-4 w-4 sm:h-6 sm:w-6" />
      default:
        return <FaCandyCane className="text-orange-200 h-3 w-3 sm:h-5 sm:w-5" />
    }
  }

  const sortedData = useMemo(() => {
    const dataToSort = [...(leaderboardData[activeCategory] || [])]
    return dataToSort.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1
      }
      return 0
    })
  }, [leaderboardData, activeCategory, sortConfig])

  const filteredLeaderboardData = useMemo(() => {
    return sortedData.filter((entry) =>
      entry.username.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [sortedData, searchTerm])

  const handleSort = (key: keyof LeaderboardEntry) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === 'asc'
          ? 'desc'
          : 'asc',
    }))
  }

  const getSortIcon = (key: string) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />
    }
    return <FaSort />
  }

  return (
    <div className="min-h-screen pt-20 sm:pt-24 flex flex-col bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 text-orange-200 overflow-hidden pb-8 relative">
      {!localSettings.disableBackgroundImage && (
        <BackgroundAnimation
          numWebs={20}
          webColor="text-orange-300"
          opacity={0.15}
        />
      )}
      <main className="flex-grow flex flex-col items-center px-4 lg:px-0 relative z-10">
        <div className="w-full max-w-6xl">
          <motion.h1
            className="mb-2 p-2 text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-wider text-center text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-purple-600 animate-gradient-x drop-shadow-[0_5px_3px_rgba(0,0,0,0.4)]"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {t.title}
          </motion.h1>
          <motion.p
            className="mb-4 text-center text-lg sm:text-xl lg:text-2xl text-orange-300"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {t.subtitle}
          </motion.p>

          <Card className="bg-gradient-to-br from-[#1a1a1d] to-[#2c003e] border-orange-500 text-orange-200 overflow-hidden rounded-2xl shadow-2xl shadow-orange-500/30 transition-shadow duration-300 hover:shadow-orange-500/50">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                <div className="relative w-full">
                  <Input
                    variant="orange"
                    type="text"
                    placeholder={t.searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-800/50 text-orange-200 border-orange-500/50 focus:border-orange-500 rounded-full"
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-500" />
                </div>
              </div>

              <Tabs
                value={activeCategory}
                onValueChange={setActiveCategory}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 bg-gray-800/50 backdrop-blur-sm rounded-full p-1 gap-2 mb-4">
                  {leaderboardCategories.map((category) => (
                    <TabsTrigger
                      key={category.id}
                      value={category.id}
                      className="rounded-full data-[state=active]:bg-orange-500 data-[state=active]:text-white transition-all duration-300"
                    >
                      <category.icon className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="hidden sm:inline">{category.name}</span>
                      <span className="sm:hidden">
                        {category.id === 'candies'
                          ? t.categories.candiesShort
                          : t.categories.spinsShort}
                      </span>
                    </TabsTrigger>
                  ))}
                </TabsList>

                {leaderboardCategories.map((category) => (
                  <TabsContent key={category.id} value={category.id}>
                    <div className="sticky top-0 bg-orange-500/70 backdrop-blur-sm rounded-full mb-2 flex justify-between text-xs sm:text-sm">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('rank')}
                        className="flex items-center"
                      >
                        {t.rank} {getSortIcon('rank')}
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('username')}
                        className="flex items-center"
                      >
                        {t.username} {getSortIcon('username')}
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() =>
                          handleSort(category.id as keyof LeaderboardEntry)
                        }
                        className="flex items-center"
                      >
                        {category.id === 'candies'
                          ? t.categories.candies
                          : t.categories.spins}{' '}
                        {getSortIcon(category.id)}
                      </Button>
                    </div>

                    <ScrollArea className="h-[350px] sm:h-[400px] pr-2">
                      <AnimatePresence>
                        {isLoading
                          ? Array.from({ length: 10 }).map((_, index) => (
                              <div
                                key={index}
                                className="mb-4 p-4 rounded-xl bg-purple-900/50 flex items-center gap-4"
                              >
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <div className="space-y-2">
                                  <Skeleton className="h-4 w-32" />
                                  <Skeleton className="h-4 w-24" />
                                </div>
                              </div>
                            ))
                          : filteredLeaderboardData.map((entry, index) => (
                              <motion.div
                                key={entry.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ delay: index * 0.05 }}
                                onMouseEnter={() => setHoveredEntry(entry.id)}
                                onMouseLeave={() => setHoveredEntry(null)}
                              >
                                <div
                                  className={`mb-4 p-2 sm:p-4 rounded-xl bg-purple-900/50 hover:bg-purple-800/50 transition-all duration-300 border border-orange-500/30 flex items-center gap-2 sm:gap-4 group relative overflow-hidden ${
                                    viewMode === 'compact' ? 'h-16' : ''
                                  }`}
                                >
                                  <div className="flex-shrink-0 w-8 sm:w-12 text-center">
                                    {getPositionIcon(entry.rank)}
                                  </div>
                                  <div
                                    className={`flex-shrink-0 rounded-full overflow-hidden border-2 border-orange-500 transition-transform duration-300 group-hover:scale-110 ${
                                      viewMode === 'compact'
                                        ? 'w-8 h-8 sm:w-10 sm:h-10'
                                        : 'w-10 h-10 sm:w-16 sm:h-16'
                                    }`}
                                  >
                                    <Link href={`/user/${entry.username}`}>
                                      <Image
                                        src={entry.avatar || '/placeholder.svg'}
                                        alt={entry.username}
                                        width={64}
                                        height={64}
                                        className="w-full h-full object-cover"
                                      />
                                    </Link>
                                  </div>
                                  <div className="flex-grow">
                                    <h3
                                      className={`font-semibold text-orange-300 group-hover:text-orange-400 transition-colors duration-300 ${
                                        viewMode === 'compact'
                                          ? 'text-sm'
                                          : 'text-sm sm:text-xl'
                                      }`}
                                    >
                                      <Link href={`/user/${entry.username}`}>
                                        {entry.username}
                                      </Link>
                                    </h3>
                                    <p
                                      className={`text-orange-200 group-hover:text-orange-300 transition-colors duration-300 ${
                                        viewMode === 'compact'
                                          ? 'text-xs'
                                          : 'text-xs sm:text-sm'
                                      }`}
                                    >
                                      {category.id === 'candies'
                                        ? t.categories.candies
                                        : t.categories.spins}
                                      :{' '}
                                      <span
                                        className={`font-bold ${
                                          viewMode === 'compact'
                                            ? 'text-sm'
                                            : 'text-sm sm:text-lg'
                                        }`}
                                      >
                                        {category.id === 'candies'
                                          ? entry.candies
                                          : entry.spins}
                                      </span>
                                    </p>
                                  </div>
                                  <div className="flex-shrink-0 w-8 sm:w-12 text-right">
                                    <span
                                      className={`font-bold text-orange-400 group-hover:text-orange-500 transition-colors duration-300 ${
                                        viewMode === 'compact'
                                          ? 'text-sm sm:text-lg'
                                          : 'text-lg sm:text-2xl'
                                      }`}
                                    >
                                      #{entry.rank}
                                    </span>
                                  </div>
                                  {viewMode === 'detailed' && (
                                    <motion.div
                                      initial={{ x: '100%' }}
                                      animate={{
                                        x:
                                          hoveredEntry === entry.id
                                            ? 0
                                            : '100%',
                                      }}
                                      transition={{
                                        type: 'spring',
                                        stiffness: 100,
                                        damping: 15,
                                      }}
                                      className="absolute right-0 top-0 bottom-0 w-1/4 rounded-xl bg-orange-500 flex items-center justify-center"
                                    >
                                      <div className="text-gray-900 font-bold text-center">
                                        <p className="text-sm sm:text-2xl">
                                          {category.id === 'candies'
                                            ? entry.spins
                                            : entry.candies}
                                        </p>
                                        <p className="text-xs sm:text-sm">
                                          {category.id === 'candies'
                                            ? t.categories.spins
                                            : t.categories.candies}
                                        </p>
                                      </div>
                                    </motion.div>
                                  )}
                                </div>
                              </motion.div>
                            ))}
                      </AnimatePresence>
                    </ScrollArea>
                  </TabsContent>
                ))}
              </Tabs>

              {userRank && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-4 p-4 rounded-xl bg-orange-500/20 border border-orange-500"
                >
                  <h3 className="text-lg font-semibold mb-2">{t.yourRank}</h3>
                  <div className="flex items-center gap-4">
                    <FaUserCircle className="text-3xl text-orange-400" />
                    <div>
                      <p className="font-medium">{userRank.username}</p>
                      <p className="text-sm">
                        {t.rank}:{' '}
                        <span className="font-bold">#{userRank.rank}</span> |
                        {t.categories.candies}:{' '}
                        <span className="font-bold">{userRank.candies}</span> |
                        {t.categories.spins}:{' '}
                        <span className="font-bold">{userRank.spins}</span>
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <p className="mt-8 text-center text-orange-200 animate-pulse z-10">
        {t.footer}
      </p>
    </div>
  )
}
