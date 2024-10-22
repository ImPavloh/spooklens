'use client'

import { useState, useEffect, useCallback } from 'react'
import filteredWordsJson from '@/utils/words.json'
// en el futuro se podría usar una lista mediante API (o en la propia base de datos)

const getChatFilterWords = (json: Record<string, string[]>): string[] => {
  return [...json.profanity, ...json.slurs]
}

const defaultFilterList = getChatFilterWords(filteredWordsJson)

export function useChatFilter(initialFilterList: string[] = defaultFilterList) {
  const [filterList, setFilterList] = useState<string[]>(initialFilterList)

  useEffect(() => {
    setFilterList(initialFilterList)
  }, [initialFilterList])

  const filterMessage = useCallback(
    (message: string): string => {
      let filteredMessage = message

      filterList.forEach((word) => {
        const regex = new RegExp(word, 'gi')
        filteredMessage = filteredMessage.replace(
          regex,
          '*'.repeat(word.length),
        )
      })

      return filteredMessage
    },
    [filterList],
  )

  const addWordToFilter = useCallback((word: string) => {
    setFilterList((prevList) => [...prevList, word.toLowerCase()])
  }, [])

  const removeWordFromFilter = useCallback((word: string) => {
    setFilterList((prevList) =>
      prevList.filter((w) => w !== word.toLowerCase()),
    )
  }, [])

  return { filterMessage, addWordToFilter, removeWordFromFilter, filterList }
}
// considero utilizar cloudinary ai (moderation) para filtrar el contenido del chat
