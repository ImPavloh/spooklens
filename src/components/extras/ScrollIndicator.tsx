'use client'

import { useEffect, useState, useRef } from 'react'

import { motion } from 'framer-motion'
import { FaChevronDown } from 'react-icons/fa'

import { useLanguage } from '@/utils/LanguageContext'

export default function ScrollIndicator() {
  const [isVisible, setIsVisible] = useState(true)
  const lastScrollY = useRef(0)
  const { language, translations } = useLanguage()
  const t = translations[language].scrollIndicator

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      setIsVisible(currentScrollY < lastScrollY.current || currentScrollY === 0)
      lastScrollY.current = currentScrollY
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center text-orange-500"
    >
      <p className="text-sm">{t.scrollMessage}</p>
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 1 }}
      >
        <FaChevronDown className="w-3 h-3 mt-2 mb-12" />
      </motion.div>
    </motion.div>
  )
}
