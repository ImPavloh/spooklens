'use client'

import React, { useMemo } from 'react'
import { GiSpiderWeb } from 'react-icons/gi'

interface BackgroundAnimationProps {
  numWebs?: number
  webColor?: string
  opacity?: number
}

const BackgroundAnimation: React.FC<BackgroundAnimationProps> = ({
  numWebs = 6,
  webColor = 'text-purple-400',
  opacity = 0.3,
}) => {
  const generateValidPosition = (
    existingPositions: { x: number; y: number }[],
    attempts: number = 100,
  ): { x: number; y: number } | null => {
    const centerX: number = window.innerWidth / 2
    const centerY: number = window.innerHeight / 2
    const minDistance: number = 200
    const minDistanceBetweenWebs: number = 150
    const topCenterMargin: number = window.innerHeight * 0.3

    for (let i = 0; i < attempts; i++) {
      const x = Math.random() * window.innerWidth
      const y = Math.random() * window.innerHeight
      const distanceToCenter: number = Math.sqrt(
        (x - centerX) ** 2 + (y - centerY) ** 2,
      )
      const isInTopCenter: boolean =
        y < topCenterMargin && Math.abs(x - centerX) < minDistance
      const isValid =
        distanceToCenter > minDistance &&
        !isInTopCenter &&
        existingPositions.every(
          (pos) =>
            Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2) >
            minDistanceBetweenWebs,
        )

      if (isValid) {
        return { x, y }
      }
    }

    return null
  }

  const webs: JSX.Element[] = useMemo(() => {
    const positions: { x: number; y: number }[] = []
    const webElements: JSX.Element[] = []

    for (let i = 0; i < numWebs; i++) {
      const position = generateValidPosition(positions)
      if (position) {
        positions.push(position)
        const size: number = 40 + Math.random() * 75
        const webOpacity: number = 0.2 + Math.random() * 0.6
        webElements.push(
          <div
            key={i}
            className={`absolute ${webColor} animate-float`}
            style={{
              left: `${position.x}px`,
              top: `${position.y}px`,
              animationDelay: `${Math.random() * 5}s`,
              opacity: webOpacity,
            }}
          >
            <GiSpiderWeb size={size} />
          </div>,
        )
      }
    }

    return webElements
  }, [numWebs, webColor])

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div
        className="absolute inset-0 bg-gradient-to-b from-purple-900 to-gray-900 animate-haunted"
        style={{
          animationDuration: '20s',
          animationIterationCount: 'infinite',
        }}
      />
      <svg className="absolute inset-0 w-full h-full">
        <filter id="fog">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.015"
            numOctaves="3"
          />
          <feDisplacementMap in="SourceGraphic" scale="100" />
        </filter>
        <rect
          width="100%"
          height="100%"
          filter="url(#fog)"
          opacity={opacity}
          fill="url(#gradient)"
        />
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(88, 28, 135, 0.8)" />
          <stop offset="100%" stopColor="rgba(17, 24, 39, 0.8)" />
        </linearGradient>
      </svg>
      {webs}
    </div>
  )
}

export default BackgroundAnimation
