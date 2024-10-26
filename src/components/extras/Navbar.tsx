'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import dynamic from 'next/dynamic'

import { motion, AnimatePresence } from 'framer-motion'
import {
  FaHome,
  FaCommentDots,
  FaSkull,
  FaCandyCane,
  FaUser,
  FaCog,
  FaBookReader,
  FaInfoCircle,
  FaSignOutAlt,
  FaSignInAlt,
  FaBars,
  FaFlask,
  FaTimes,
} from 'react-icons/fa'
import { IconType } from 'react-icons'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import { auth, signOut, db } from '@/lib/firebase'
import { doc, onSnapshot } from 'firebase/firestore'

const AuthModal = dynamic(() => import('@/components/modals/AuthModal'), {
  ssr: false,
})
const NavbarInfoModal = dynamic(
  () => import('@/components/modals/AboutModal'),
  { ssr: false },
)
const SettingsModal = dynamic(
  () => import('@/components/modals/SettingsModal'),
  { ssr: false },
)
const TutorialModal = dynamic(
  () => import('@/components/modals/TutorialModal'),
  { ssr: false },
)

const navItems = [
  { path: '/home', icon: FaHome, label: 'Home' },
  { path: '/chats', icon: FaCommentDots, label: 'Chats' },
  { path: '/leaderboard', icon: FaSkull, label: 'Leaderboard' },
  { path: '/store', icon: FaCandyCane, label: 'Candy Store' },
]

interface MobileMenuItemProps {
  icon: IconType
  label: string
  onClick: () => void
  isActive?: boolean
}

const MobileMenuItem: React.FC<MobileMenuItemProps> = ({
  icon: Icon,
  label,
  onClick,
  isActive,
}) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
  >
    <Button
      onClick={onClick}
      className={`w-full justify-start text-orange-200 hover:text-orange-100 hover:bg-orange-900/20 mb-2 ${
        isActive ? 'bg-orange-900/30 text-orange-100' : ''
      }`}
    >
      <Icon className="h-5 w-5 mr-3" aria-hidden="true" />
      <span>{label}</span>
    </Button>
  </motion.div>
)

export default function Component() {
  const [isHovered, setIsHovered] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)
  const [isTutorialModalOpen, setIsTutorialModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [userName, setUserName] = useState<string | null>(null)
  const [userAvatar, setUserAvatar] = useState<string | null>(null)
  const [candies, setCandies] = useState(0)
  const [potions, setPotions] = useState(0)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial')
    if (!hasSeenTutorial) {
      setIsTutorialModalOpen(true)
      localStorage.setItem('hasSeenTutorial', 'true')
    }

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        const userRef = doc(db, 'users', user.uid)
        const unsubscribeUser = onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
            const userData = doc.data()
            setUserName(userData.username || 'Spooky Ghost')
            setUserAvatar(userData.avatar || '/images/avatars/avatar1.png')
            setCandies(userData.totalCandies || 0)
            setPotions(userData.potions || 0)
          }
        })

        return () => unsubscribeUser()
      } else {
        setUserName(null)
        setUserAvatar(null)
        setCandies(0)
        setPotions(0)
      }
    })

    return () => unsubscribe()
  }, [])

  const handleLoginClick = useCallback(() => setIsAuthModalOpen(true), [])

  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth)
      router.push('/')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }, [router])

  const openProfilePage = useCallback(() => {
    if (auth.currentUser && !auth.currentUser.isAnonymous) {
      if (userName) {
        router.push(`/user/${userName}`)
      } else {
        router.push(`/user/${auth.currentUser.uid}`)
      }
    } else {
      setIsAuthModalOpen(true)
    }
  }, [router, userName])

  const openInfoModal = useCallback(() => setIsInfoModalOpen(true), [])
  const openSettingsModal = useCallback(() => setIsSettingsModalOpen(true), [])
  const openTutorialModal = useCallback(() => setIsTutorialModalOpen(true), [])

  const toggleMenu = useCallback(() => setIsMenuOpen((prev) => !prev), [])

  const menuVariants = {
    open: {
      opacity: 1,
      height: 'auto',
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.07,
        delayChildren: 0.2,
      },
    },
    closed: {
      opacity: 0,
      height: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.05,
        staggerDirection: -1,
      },
    },
  }

  const itemVariants = {
    open: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 24 },
    },
    closed: { opacity: 0, y: 20, transition: { duration: 0.2 } },
  }

  const NavItem = useCallback(
    ({
      path,
      icon: Icon,
      label,
    }: {
      path: string
      icon: IconType
      label: string
    }) => (
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        layout
      >
        <Button
          asChild
          className={`text-orange-200 hover:text-orange-100 hover:bg-orange-900/20 transition-colors duration-200 ${
            pathname === path ? 'bg-orange-900/30 text-orange-100' : ''
          }`}
        >
          <Link href={path} className="flex items-center space-x-1">
            <Icon className="h-4 w-4 mr-2" aria-hidden="true" />
            <span>{label}</span>
          </Link>
        </Button>
      </motion.div>
    ),
    [pathname],
  )

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed top-4 transform -translate-x-1/2 w-11/12 max-w-7xl rounded-full z-50 bg-gray-900/60 backdrop-blur-md shadow-2xl shadow-black/50 border border-gray-700 inset-x-0 mx-auto space-x-6"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12 sm:h-16">
            <div className="flex items-center">
              <Link
                href="/"
                className="text-2xl font-bold text-orange-500 flex items-center hover:text-orange-400 transition-colors duration-200"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <motion.div
                  animate={{ rotate: isHovered ? 20 : 0 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="mr-2"
                >
                  <Image
                    src="/images/logo2.png"
                    alt="SpookLens logo"
                    draggable="false"
                    width={40}
                    height={40}
                    priority
                  />
                </motion.div>
                <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-purple-600 hover:from-orange-300 hover:via-red-400 hover:to-purple-500 transition-all duration-300 hidden sm:inline font-halloween">
                  SpookLens
                </span>
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              {navItems.map((item) => (
                <NavItem key={item.path} {...item} />
              ))}
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center space-x-1 sm:space-x-2 bg-purple-900/50 rounded-full px-2 sm:px-3 py-1"
                    >
                      <FaCandyCane
                        className="text-pink-400 w-3 h-3 sm:w-4 sm:h-4"
                        aria-hidden="true"
                      />
                      <span className="text-pink-400 font-bold text-xs sm:text-sm">
                        {candies}
                      </span>
                      <FaFlask
                        className="text-green-400 w-3 h-3 sm:w-4 sm:h-4"
                        aria-hidden="true"
                      />
                      <span className="text-green-400 font-bold text-xs sm:text-sm">
                        {potions}
                      </span>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {candies} Candies | {potions} Magical Potions
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="relative h-8 w-8 sm:h-10 sm:w-10 rounded-full overflow-hidden hidden sm:flex transition-all duration-200 sm:border-2 border-orange-500 hover:border-orange-300 shadow-lg hover:shadow-orange-300/30">
                    <Avatar>
                      <AvatarImage
                        src={userAvatar || '/images/avatars/avatar1.png'}
                        alt="Profile"
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-gray-700 text-orange-400 text-lg font-bold">
                        S
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 sm:w-64 bg-gray-900/80 border border-orange-600 rounded-lg shadow-xl overflow-hidden"
                  align="end"
                  forceMount
                >
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-2 p-3">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                          <AvatarImage
                            src={userAvatar || '/images/avatars/avatar1.png'}
                            alt="Profile"
                            className="object-cover rounded-full"
                          />
                          <AvatarFallback className="bg-orange-600 text-gray-900 text-lg font-bold">
                            S
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-orange-200">
                          <p className="text-xs sm:text-sm font-semibold">
                            {userName || 'Mysterious User'}
                          </p>
                          <p className="text-xs hidden sm:block">
                            {auth.currentUser?.email || 'No email provided'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-orange-500/50" />
                  <DropdownMenuItem
                    onClick={openProfilePage}
                    className="text-orange-200 hover:bg-orange-500/20 focus:bg-orange-500  focus:text-white"
                  >
                    <FaUser className="mr-2 h-4 w-4" aria-hidden="true" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={openSettingsModal}
                    className="text-orange-200 hover:bg-orange-500/20 focus:bg-orange-500 focus:text-white"
                  >
                    <FaCog className="mr-2 h-4 w-4" aria-hidden="true" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={openTutorialModal}
                    className="text-orange-200 hover:bg-orange-500/20 focus:bg-orange-500 focus:text-white"
                  >
                    <FaBookReader className="mr-2 h-4 w-4" aria-hidden="true" />
                    <span>Getting Started</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={openInfoModal}
                    className="text-orange-200 hover:bg-orange-500/20 focus:bg-orange-500 focus:text-white"
                  >
                    <FaInfoCircle className="mr-2 h-4 w-4" aria-hidden="true" />
                    <span>About SpookLens</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-orange-500/50" />
                  {auth.currentUser && !auth.currentUser.isAnonymous ? (
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-orange-200 hover:bg-orange-500/20 focus:bg-orange-500 focus:text-white"
                    >
                      <FaSignOutAlt
                        className="mr-2 h-4 w-4"
                        aria-hidden="true"
                      />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      onClick={handleLoginClick}
                      className="text-orange-200 hover:bg-orange-500/20 focus:bg-orange-500 focus:text-white"
                    >
                      <FaSignInAlt
                        className="mr-2 h-4 w-4"
                        aria-hidden="true"
                      />
                      <span>Sign In</span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="md:hidden"
              >
                <Button
                  onClick={toggleMenu}
                  className="text-orange-300 hover:text-orange-100 hover:bg-orange-900/20 p-2"
                  aria-label="Toggle menu"
                  aria-expanded={isMenuOpen}
                >
                  {isMenuOpen ? (
                    <FaTimes
                      className="h-5 w-5 sm:h-6 sm:w-6"
                      aria-hidden="true"
                    />
                  ) : (
                    <FaBars
                      className="h-5 w-5 sm:h-6 sm:w-6"
                      aria-hidden="true"
                    />
                  )}
                </Button>
              </motion.div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={menuVariants}
              className="absolute top-full left-0 right-0 mt-2 md:hidden"
            >
              <div className="bg-gray-900/90 backdrop-blur-md border border-orange-500/30 rounded-2xl shadow-lg overflow-hidden p-4">
                <motion.div variants={itemVariants}>
                  <h3 className="text-orange-300 text-sm font-semibold m-2">
                    Navigation
                  </h3>
                  {navItems.map(({ path, icon, label }) => (
                    <MobileMenuItem
                      key={path}
                      icon={icon}
                      label={label}
                      onClick={() => {
                        router.push(path)
                        setIsMenuOpen(false)
                      }}
                      isActive={pathname === path}
                    />
                  ))}
                </motion.div>
                <motion.div variants={itemVariants}>
                  <h3 className="text-orange-300 text-sm font-semibold m-2">
                    User Actions
                  </h3>
                  <div className="flex justify-around mb-4">
                    <Button
                      onClick={() => {
                        openSettingsModal()
                        setIsMenuOpen(false)
                      }}
                      className="text-orange-200 hover:text-orange-100 hover:bg-orange-900/20"
                    >
                      <FaCog className="h-5 w-5" aria-hidden="true" />
                    </Button>
                    <Button
                      onClick={() => {
                        openTutorialModal()
                        setIsMenuOpen(false)
                      }}
                      className="text-orange-200 hover:text-orange-100 hover:bg-orange-900/20"
                    >
                      <FaBookReader className="h-5 w-5" aria-hidden="true" />
                    </Button>
                    <Button
                      onClick={() => {
                        openInfoModal()
                        setIsMenuOpen(false)
                      }}
                      className="text-orange-200 hover:text-orange-100 hover:bg-orange-900/20"
                    >
                      <FaInfoCircle className="h-5 w-5" aria-hidden="true" />
                    </Button>
                  </div>
                  <div className="flex justify-center">
                    <Button
                      onClick={() => {
                        openProfilePage()
                        setIsMenuOpen(false)
                      }}
                      className="text-orange-200 hover:text-orange-100 hover:bg-orange-900/20"
                    >
                      <FaUser className="h-5 w-5" aria-hidden="true" />
                    </Button>
                    {auth.currentUser && !auth.currentUser.isAnonymous ? (
                      <Button
                        onClick={() => {
                          handleLogout()
                          setIsMenuOpen(false)
                        }}
                        className="text-orange-200 hover:text-orange-100 hover:bg-orange-900/20"
                      >
                        <FaSignOutAlt
                          className="h-5 w-5 mr-2"
                          aria-hidden="true"
                        />
                        <span>Log out</span>
                      </Button>
                    ) : (
                      <Button
                        onClick={() => {
                          handleLoginClick()
                          setIsMenuOpen(false)
                        }}
                        className="text-orange-200 hover:text-orange-100 hover:bg-orange-900/20"
                      >
                        <FaSignInAlt
                          className="h-5 w-5 mr-2"
                          aria-hidden="true"
                        />
                        <span>Sign In</span>
                      </Button>
                    )}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
      <NavbarInfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
      />
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
      <TutorialModal
        isOpen={isTutorialModalOpen}
        onClose={() => setIsTutorialModalOpen(false)}
      />
    </>
  )
}
