// no disponible actuamente (solo frontend activo)
'use client'

import { useState } from 'react' // useEffect
import dynamic from 'next/dynamic'

import { motion, AnimatePresence } from 'framer-motion'
import {
  FaCompactDisc,
  FaFlask,
  FaCheck,
  FaSpellCheck,
  FaGhost,
  FaCandyCane,
} from 'react-icons/fa'
import {
  GiPumpkin,
  GiSpellBook,
  GiBat,
  GiCauldron,
  GiCandleSkull,
} from 'react-icons/gi'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { useToast } from '@/hooks/useToast'
/*import { auth, db } from '@/lib/firebase'
import { doc, getDoc, updateDoc, collection, addDoc } from 'firebase/firestore'*/

const ComingSoonModal = dynamic(
  () => import('@/components/modals/ComingSoonModal'),
  {
    ssr: false,
  },
)

const storeItems = [
  {
    id: 1,
    name: 'Ghost Gummies',
    icon: FaGhost,
    candyCost: 10,
    potionCost: 1,
    description: 'Boost your visibility for 24 hours',
    category: 'consumables',
  },
  {
    id: 2,
    name: 'Pumpkin Potion',
    icon: GiPumpkin,
    candyCost: 20,
    potionCost: 2,
    description: 'Double your likes for your next post',
    category: 'consumables',
  },
  {
    id: 3,
    name: 'Bat Wings',
    icon: GiBat,
    candyCost: 15,
    potionCost: 1,
    description: 'Fly to the top of the feed for 1 hour',
    category: 'consumables',
  },
  {
    id: 4,
    name: 'Spider Silk',
    icon: FaSpellCheck,
    candyCost: 30,
    potionCost: 3,
    description: 'Catch 5 random users attention',
    category: 'consumables',
  },
  {
    id: 5,
    name: "Witch's Broom",
    icon: GiSpellBook,
    candyCost: 50,
    potionCost: 5,
    description: 'Unlock special profile animations',
    category: 'cosmetics',
  },
  {
    id: 6,
    name: 'Wizard Hat',
    icon: GiCauldron,
    candyCost: 40,
    potionCost: 4,
    description: 'Add a magical hat to your profile picture',
    category: 'cosmetics',
  },
  {
    id: 7,
    name: 'Skull Amulet',
    icon: GiCandleSkull,
    candyCost: 60,
    potionCost: 6,
    description: 'Intimidate other users with this spooky accessory',
    category: 'cosmetics',
  },
  {
    id: 8,
    name: 'Spell Book',
    icon: GiSpellBook,
    candyCost: 100,
    potionCost: 10,
    description: 'Learn new spells to cast on your photos',
    category: 'upgrades',
  },
  {
    id: 9,
    name: 'Cauldron Upgrade',
    icon: GiCauldron,
    candyCost: 80,
    potionCost: 8,
    description: 'Increase your potion brewing capacity',
    category: 'upgrades',
  },
  {
    id: 10,
    name: '1 new song',
    icon: FaCompactDisc ,
    candyCost: 80,
    potionCost: 8,
    description: 'Add a new song to your spooky playlist!',
    category: 'music',
  },
  {
    id: 11,
    name: '1 new playlist',
    icon: FaCompactDisc,
    candyCost: 1000,
    potionCost: 10,
    description: 'Add a new playlist to your account!',
    category: 'music',
  },
]

interface UserResources {
  candies: number
  potions: number
}

export default function CandyStore() {
  const [userResources, setUserResources] = useState<UserResources>({
    candies: 0,
    potions: 0,
  })
  const [activeTab, setActiveTab] = useState('all')
  const [showComingSoon, setShowComingSoon] = useState(true)
  const { toast } = useToast()
  /*  const user = auth.currentUser

  useEffect(() => {
    if (user) {
      fetchUserData()
    }
  }, [user])

  const fetchUserData = async () => {
    if (!user) return

    const userDocRef = doc(db, 'users', user.uid)
    const userDoc = await getDoc(userDocRef)
    if (userDoc.exists()) {
      const userData = userDoc.data()
      setUserResources({
        candies: userData.candies || 0,
        potions: userData.potions || 0,
      })
    }
  }

  const updateUserResources = async (newResources: UserResources) => {
    if (!user) return

    const userDocRef = doc(db, 'users', user.uid)
    await updateDoc(userDocRef, newResources)
    setUserResources(newResources)
  }

  const logPurchase = async (item: (typeof storeItems)[0]) => {
    if (!user) return

    const purchasesRef = collection(db, 'purchases')
    await addDoc(purchasesRef, {
      userId: user.uid,
      itemId: item.id,
      itemName: item.name,
      candyCost: item.candyCost,
      potionCost: item.potionCost,
      purchaseDate: new Date(),
    })
  }

  const purchaseItem = async (item: (typeof storeItems)[0]) => {
    if (
      userResources.candies >= item.candyCost &&
      userResources.potions >= item.potionCost &&
    ) {
      const newResources = {
        candies: userResources.candies - item.candyCost,
        potions: userResources.potions - item.potionCost,
      }

      /*await updateUserResources(newResources)
      await logPurchase(item)

      toast({
        title: 'Purchase Successful!',
        description: `You've acquired ${item.name}. It has been added to your inventory.`,
        duration: 3000,
      })
    } else {
      toast({
        title: 'Insufficient Resources',
        description: "You don't have enough resources to make this purchase.",
        variant: 'destructive',
        duration: 3000,
      })
    }
  }*/

  const filteredItems =
    activeTab === 'all'
      ? storeItems
      : storeItems.filter((item) => item.category === activeTab)

  return (
    <motion.div
      initial={{ opacity: 0.2 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 text-orange-200 overflow-hidden pt-24 relative"
    >
      <main className="flex-grow flex flex-col items-center px-4 lg:px-0 relative">
        <div className="relative z-10 w-full max-w-7xl py-8">
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
              <FaGhost
                className="h-8 w-8 text-orange-500 animate-pulse"
                aria-hidden="true"
              />
            </motion.span>
            <motion.span
              className="absolute -right-8 -bottom-8"
              animate={{ y: [0, 5, 0], rotate: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            >
              <GiCandleSkull
                className="h-8 w-8 text-orange-500 animate-pulse"
                aria-hidden="true"
              />
            </motion.span>
            Spooky Candy Store
          </motion.h1>
          <motion.p
            className="mb-8 text-center text-lg lg:text-xl text-orange-300"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Buy special treats and upgrades using your candies and potions!
          </motion.p>
          <motion.div
            className="flex justify-between items-center mb-8 flex-wrap gap-4"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className="flex justify-between items-center flex-wrap gap-4">
              <motion.div className="flex items-center bg-purple-900/50 rounded-full px-3 py-1 shadow-lg shadow-pink-500/20">
                <FaCandyCane className="text-pink-400 mr-2 animate-spin-slow" />
                <span className="text-pink-400 font-bold">
                  {userResources.candies} Candies
                </span>
              </motion.div>
              <motion.div className="flex items-center bg-purple-900/50 rounded-full px-3 py-1 shadow-lg shadow-green-500/20">
                <FaFlask className="text-green-400 mr-2 animate-bounce-slow" />
                <span className="text-green-400 font-bold">
                  {userResources.potions} Potions
                </span>
              </motion.div>
            </div>

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex justify-center"
              defaultValue="all"
            >
              <TabsList className="grid w-full grid-cols-5 bg-gray-800/50 backdrop-blur-sm rounded-full p-1 gap-2">
                <TabsTrigger value="all" className="rounded-full">
                  All Items
                </TabsTrigger>
                <TabsTrigger value="consumables" className="rounded-full">
                  Consumables
                </TabsTrigger>
                <TabsTrigger value="cosmetics" className="rounded-full">
                  Cosmetics
                </TabsTrigger>
                <TabsTrigger value="upgrades" className="rounded-full">
                  Upgrades
                </TabsTrigger>
                <TabsTrigger value="music" className="rounded-full">
                  Music
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-gradient-to-br from-[#1a1a1d] to-[#2c003e] border-orange-500 text-orange-200 overflow-hidden rounded-lg shadow-xl shadow-orange-500/20 transition-shadow duration-300">
                    <CardHeader className="p-4 border-b border-orange-500/30">
                      <CardTitle className="flex items-center text-3xl font-halloween text-orange-500 animate-flicker">
                        <item.icon className="mr-3 text-orange-500 animate-glow" />
                        {item.name}
                      </CardTitle>
                      <CardDescription className="text-orange-400 mt-2 italic text-lg text-glow">
                        {item.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="p-3">
                      <div className="flex justify-center items-center gap-6">
                        <div className="flex items-center space-x-2">
                          <FaCandyCane className="text-pink-400 animate-spin-slow" />
                          <span className="text-pink-400 text-lg font-medium">
                            {item.candyCost}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FaFlask className="text-green-400 animate-bounce-slow" />
                          <span className="text-green-400 text-lg font-medium">
                            {item.potionCost}
                          </span>
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="p-3 border-t border-orange-500/30 flex flex-col items-center gap-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="w-full bg-purple-700 hover:bg-purple-800 text-white py-2 px-4 rounded-lg text-lg font-semibold hover:animate-pulse shadow-sm shadow-purple-500/50 transition-all duration-300">
                            Purchase
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-gradient-to-br from-[#2c003e] to-[#1a1a1d] text-orange-200 border-2 border-orange-500 p-6 rounded-lg shadow-2xl shadow-orange-500/30 max-w-2xl">
                          {' '}
                          <DialogHeader className="text-center">
                            <DialogTitle className="text-2xl font-halloween text-orange-500 animate-flicker">
                              Confirm Purchase
                            </DialogTitle>
                            <DialogDescription className="text-orange-400 mt-4 text-lg italic">
                              Are you sure you want to purchase{' '}
                              <strong>{item.name}</strong>?
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter className="flex justify-between items-center gap-4 mt-6">
                            <div className="flex items-center space-x-2">
                              <FaCandyCane className="text-pink-400 animate-spin-slow" />
                              <span className="text-pink-400 font-medium">
                                {item.candyCost} Candies
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <FaFlask className="text-green-400 animate-bounce-slow" />
                              <span className="text-green-400 font-medium">
                                {item.potionCost} Potions
                              </span>
                            </div>
                            <Button
                              // onClick={() => purchaseItem(item)}
                              className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg text-lg font-semibold shadow-sm shadow-purple-500/50 transition-all duration-300 hover:animate-pulse"
                            >
                              <FaCheck className="mr-2" />
                              Confirm Purchase
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </main>
      <ComingSoonModal
        isOpen={showComingSoon}
        onClose={() => setShowComingSoon(false)}
        page="store"
      />
    </motion.div>
  )
}
