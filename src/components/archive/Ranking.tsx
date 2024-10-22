/*
'use client'

import React from 'react'
import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FaSpinner, FaGhost, FaCrown, FaCandyCane } from 'react-icons/fa'
import { GiBat, GiPumpkin, GiCauldron, GiSpiderWeb } from 'react-icons/gi'
import Image from 'next/image'
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  increment,
} from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'
import { useToast } from '@/hooks/useToast'

interface Profile {
  uid: string
  imageUrl: string
  description: string
  votes: number
}

export default function Ranking() {
  const [topProfiles, setTopProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [voting, setVoting] = useState<Record<string, boolean>>({})
  const { toast } = useToast()

  useEffect(() => {
    const q = query(
      collection(db, 'users'),
      orderBy('votes', 'desc'),
      limit(10),
    )

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const profiles: Profile[] = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        uid: doc.id,
      })) as Profile[]
      setTopProfiles(profiles)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleVote = async (userId: string) => {
    if (voting[userId]) return

    setVoting((prev) => ({ ...prev, [userId]: true }))

    try {
      const voteRef = doc(db, 'votes', `${auth.currentUser?.uid}_${userId}`)
      const docSnap = await getDoc(voteRef)

      if (!docSnap.exists()) {
        await setDoc(voteRef, { voted: true })
        const userRef = doc(db, 'users', userId)
        await updateDoc(userRef, { votes: increment(1) })

        toast({
          title: 'Vote Registered',
          description: 'Your spooky vote has been counted!',
          variant: 'default',
        })
      } else {
        toast({
          title: 'Already Voted',
          description: "You've already cast your spell on this profile.",
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'A dark force prevented your vote. Try again later.',
        variant: 'destructive',
      })
    } finally {
      setVoting((prev) => ({ ...prev, [userId]: false }))
    }
  }

  const debouncedVote = useMemo(
    () => (userId: string) => handleVote(userId),
    [],
  )

  const rankIcons = [FaCrown, GiPumpkin, GiBat]

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="w-full flex justify-center items-center h-64"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <GiSpiderWeb className="h-12 w-12 text-orange-500" />
        </motion.div>
        <p className="ml-4 text-orange-300 font-halloween text-xl">
          Summoning top spectral entities...
        </p>
      </motion.div>
    )
  }

  return (
    <Card className="h-full w-full max-w-lg flex flex-col bg-gradient-to-br from-[#1a1a1d] to-[#2c003e] border-orange-500 shadow-xl overflow-hidden shadow-orange-500/50 [box-shadow:rgba(255,165,0,0.2)_5px_5px,rgba(255,165,0,0.15)_10px_10px,rgba(255,165,0,0.1)_15px_15px,rgba(255,165,0,0.05)_20px_20px,rgba(255,165,0,0.025)_25px_25px]">
      <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 p-4">
        <CardTitle className="text-2xl font-semibold text-white flex items-center justify-center font-halloween">
          <motion.div
            animate={{ rotate: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <FaGhost className="mr-2 h-6 w-6" aria-hidden="true" />
          </motion.div>
          Spectral Ranking
          <motion.div
            animate={{ rotate: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
          >
            <GiCauldron className="ml-2 h-6 w-6" aria-hidden="true" />
          </motion.div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden p-4">
        <AnimatePresence>
          {topProfiles.length > 0 ? (
            topProfiles.map((profile, index) => (
              <motion.div
                key={profile.uid}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  className={`flex items-center justify-between p-4 rounded-lg shadow-lg transition-all ${
                    index === 0
                      ? 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-400'
                      : index === 1
                      ? 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border border-gray-400'
                      : index === 2
                      ? 'bg-gradient-to-r from-orange-400/20 to-orange-500/20 border border-orange-400'
                      : 'bg-gradient-to-r from-purple-900/50 to-gray-800/50 border border-gray-700'
                  }`}
                >
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-orange-500 mr-4 font-halloween w-8">
                      {index < 3 ? (
                        <motion.div
                          animate={{ rotate: [0, 10, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          {React.createElement(rankIcons[index], {
                            className: 'h-8 w-8',
                          })}
                        </motion.div>
                      ) : (
                        index + 1
                      )}
                    </span>
                    <motion.div whileHover={{ scale: 1.1 }} className="mr-4">
                      <Avatar className="h-16 w-16 border-4 border-orange-500">
                        <AvatarImage
                          src={profile.imageUrl || '/default-avatar.png'}
                          alt={profile.description || 'No description'}
                        />
                        <AvatarFallback>
                          <FaGhost className="h-8 w-8 text-orange-500" />
                        </AvatarFallback>
                      </Avatar>
                    </motion.div>
                    <div>
                      <p className="font-semibold text-orange-300 font-halloween text-lg">
                        {profile.description || 'Mysterious Spirit'}
                      </p>
                      <p className="text-sm text-orange-200 flex items-center">
                        <FaCandyCane className="mr-1 text-pink-400" />
                        {profile.votes} haunting votes
                      </p>
                    </div>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={() => debouncedVote(profile.uid)}
                      disabled={voting[profile.uid]}
                      aria-live="polite"
                      className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-halloween py-2 px-4 rounded-lg shadow-lg shadow-orange-500/30 transition-all duration-300"
                    >
                      {voting[profile.uid] ? (
                        <FaSpinner className="animate-spin mr-2" />
                      ) : (
                        <GiBat className="mr-2" />
                      )}
                      {voting[profile.uid]
                        ? 'Casting Spell...'
                        : 'Cast Your Vote'}
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.div>
            ))
          ) : (
            <div className="text-center text-purple-300 mt-6">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Image
                  src="/images/sad-logo2.png"
                  alt="SpookLens"
                  className="mx-auto mb-4 filter drop-shadow-[0_0_20px_rgba(255,255,255,0.7)]"
                  width={160}
                  height={160}
                />
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-orange-300 font-halloween text-xl"
              >
                No spirits have risen to the ranking yet.
              </motion.p>
            </div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
*/
