import { useRef, useCallback } from 'react'

export function useAudio(src: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const play = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(src)
      audioRef.current.volume = 0.5
    }
    audioRef.current.currentTime = 0
    audioRef.current.play()
  }, [src])

  return play
}