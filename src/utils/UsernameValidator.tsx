'use client'

import { useState, useEffect, useCallback } from 'react'
import { useFirestore } from '@/hooks/useFirestore'
import filteredWordsJson from '@/utils/words.json'

const flattenFilteredWords = (json: Record<string, string[]>): string[] => {
  return Object.values(json).flat()
}

const defaultReservedWords = flattenFilteredWords(filteredWordsJson)

export function useUsernameValidator(initialReservedWords: string[] = defaultReservedWords) {
  const [reservedWords, setReservedWords] = useState<string[]>(initialReservedWords)
  const { getDocuments } = useFirestore()

  useEffect(() => {
    setReservedWords(initialReservedWords)
  }, [initialReservedWords])

  const isUsernameTaken = useCallback(async (username: string): Promise<boolean> => {
    try {
      const users = await getDocuments('users', [['username', '==', username]])
      return Array.isArray(users) && users.length > 0
    } catch (error) {
      console.error('Error checking username:', error)
      throw new Error('Failed to check username availability')
    }
  }, [getDocuments])

  const validateUsername = useCallback(async (username: string): Promise<string | null> => {
    if (!username.trim()) {
      return 'Username cannot be empty.'
    }

    if (username.length < 3 || username.length > 20) {
      return 'Username must be between 3 and 20 characters long.'
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return 'Username can only contain letters, numbers, and underscores.'
    }

    if (reservedWords.includes(username.toLowerCase())) {
      return 'This username is reserved and cannot be used.'
    }

    if (await isUsernameTaken(username)) {
      return 'This username is already taken.'
    }

    return null
  }, [reservedWords, isUsernameTaken])

  const addReservedWord = useCallback((word: string) => {
    setReservedWords(prevList => [...prevList, word.toLowerCase()])
  }, [])

  const removeReservedWord = useCallback((word: string) => {
    setReservedWords(prevList => prevList.filter(w => w !== word.toLowerCase()))
  }, [])

  return { validateUsername, addReservedWord, removeReservedWord, reservedWords }
}