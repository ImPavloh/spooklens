'use client'

import { useState, useEffect, useCallback } from 'react'
import { useFirestore } from '@/hooks/useFirestore'
import filteredWordsJson from '@/utils/words.json'
import { useLanguage } from '@/utils/LanguageContext'

const flattenFilteredWords = (json: Record<string, string[]>): string[] => {
  return Object.values(json).flat()
}

const defaultReservedWords = flattenFilteredWords(filteredWordsJson)

export function useUsernameValidator(
  initialReservedWords: string[] = defaultReservedWords,
) {
  const [reservedWords, setReservedWords] =
    useState<string[]>(initialReservedWords)
  const { getDocuments } = useFirestore()
  const { language, translations } = useLanguage()
  const t = translations[language].usernameValidator

  useEffect(() => {
    setReservedWords(initialReservedWords)
  }, [initialReservedWords])

  const isUsernameTaken = useCallback(
    async (username: string): Promise<boolean> => {
      try {
        const users = await getDocuments('users', [
          ['username', '==', username],
        ])
        return Array.isArray(users) && users.length > 0
      } catch (error) {
        console.error(t.errorCheckingUsername, error)
        throw new Error(t.failedToCheckUsername)
      }
    },
    [getDocuments, t],
  )

  const validateUsername = useCallback(
    async (username: string): Promise<string | null> => {
      if (!username.trim()) {
        return t.emptyUsername
      }

      if (username.length < 3 || username.length > 20) {
        return t.usernameLengthError
      }

      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return t.usernameCharactersError
      }

      if (reservedWords.includes(username.toLowerCase())) {
        return t.reservedUsernameError
      }

      if (await isUsernameTaken(username)) {
        return t.usernameTakenError
      }

      return null
    },
    [reservedWords, isUsernameTaken, t],
  )

  const addReservedWord = useCallback((word: string) => {
    setReservedWords((prevList) => [...prevList, word.toLowerCase()])
  }, [])

  const removeReservedWord = useCallback((word: string) => {
    setReservedWords((prevList) =>
      prevList.filter((w) => w !== word.toLowerCase()),
    )
  }, [])

  return {
    validateUsername,
    addReservedWord,
    removeReservedWord,
    reservedWords,
  }
}
