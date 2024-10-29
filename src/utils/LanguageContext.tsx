'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import translations from './translations.json'

type Language = 'en' | 'es'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  translations: typeof translations
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
)

const supportedLanguages: Language[] = ['en', 'es']

const getInitialLanguage = (): Language => {
  if (typeof window !== 'undefined') {
    const storedLanguage = localStorage.getItem('language') as Language
    if (storedLanguage && supportedLanguages.includes(storedLanguage)) {
      return storedLanguage
    }

    const browserLanguages = navigator.languages || [navigator.language]
    for (const lang of browserLanguages) {
      const shortLang = lang.split('-')[0] as Language
      if (supportedLanguages.includes(shortLang)) {
        return shortLang
      }
    }
  }

  return 'en'
}

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [language, setLanguage] = useState<Language>(getInitialLanguage)

  useEffect(() => {
    const initialLang = getInitialLanguage()
    setLanguage(initialLang)
    document.documentElement.lang = initialLang
  }, [])

  useEffect(() => {
    localStorage.setItem('language', language)
    document.documentElement.lang = language
  }, [language])

  const handleSetLanguage = (newLanguage: Language) => {
    if (supportedLanguages.includes(newLanguage)) {
      setLanguage(newLanguage)
    } else {
      console.warn(
        `Unsupported language: ${newLanguage}. Defaulting to English.`,
      )
      setLanguage('en')
    }
  }

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage: handleSetLanguage,
        translations,
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
