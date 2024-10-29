'use client'

import { useEffect, useState } from 'react'

import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'

import { motion } from 'framer-motion'
import { GiPumpkin } from 'react-icons/gi'

interface ProtectedRouteProps {
  children: React.ReactNode
  onModalOpen?: () => void
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  onModalOpen,
}) => {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoading(false)
      if (!user) {
        onModalOpen?.()
      }
    })

    return () => {
      unsubscribe()
    }
  }, [onModalOpen])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background overflow-hidden">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, loop: Infinity, ease: 'linear' }}
        >
          <GiPumpkin
            className="h-16 w-16 text-orange-500"
            aria-label="Loading"
          />
        </motion.div>
      </div>
    )
  }

  return <>{children}</>
}

export default ProtectedRoute
