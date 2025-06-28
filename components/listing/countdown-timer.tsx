import React, { useEffect, useState } from 'react'
import { Text, XStack } from 'tamagui'

interface CountdownTimerProps {
  endTime: string // ISO string
  onExpired?: () => void
  size?: 'small' | 'medium' | 'large'
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

/**
 * Live countdown timer that updates every second until auction ends.
 * Shows "Ended" when time is up and triggers callback.
 */
export function CountdownTimer({ endTime, onExpired, size = 'medium' }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null)
  const [hasEnded, setHasEnded] = useState(false)

  const calculateTimeLeft = (): TimeLeft | null => {
    const difference = new Date(endTime).getTime() - new Date().getTime()
    
    if (difference <= 0) {
      return null
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60)
    }
  }

  useEffect(() => {
    const timer = setInterval(() => {
      const time = calculateTimeLeft()
      
      if (!time) {
        setHasEnded(true)
        setTimeLeft(null)
        onExpired?.()
        clearInterval(timer)
      } else {
        setTimeLeft(time)
      }
    }, 1000)

    // Initial calculation
    const initialTime = calculateTimeLeft()
    if (!initialTime) {
      setHasEnded(true)
    } else {
      setTimeLeft(initialTime)
    }

    return () => clearInterval(timer)
  }, [endTime, onExpired])

  const textSize = {
    small: '$2',
    medium: '$3',
    large: '$4'
  }[size]

  if (hasEnded) {
    return (
      <XStack backgroundColor="$muted" alignItems="center" borderRadius="$5" paddingHorizontal="$2" paddingVertical="$2">
        <Text fontSize={textSize} color="$foreground" fontWeight="500">
          Ended
        </Text>
      </XStack>
    )
  }

  if (!timeLeft) {
    return (
      <XStack backgroundColor="$muted" alignItems="center" borderRadius="$5" paddingHorizontal="$2" paddingVertical="$2">
        <Text fontSize={textSize} color="$mutedForeground">
          Loading...
        </Text>
      </XStack>
    )
  }

  const formatTime = (time: TimeLeft): string => {
    if (time.days > 0) {
      return `${time.days}d ${time.hours}h ${time.minutes}m`
    } else if (time.hours > 0) {
      return `${time.hours}h ${time.minutes}m ${time.seconds}s`
    } else {
      return `${time.minutes}m ${time.seconds}s`
    }
  }

  return (
    <XStack backgroundColor="$muted" alignItems="center" borderRadius="$5" paddingHorizontal="$2" paddingVertical="$2">
      <Text fontSize={textSize} color="$foreground" fontWeight="500">
        {formatTime(timeLeft)}
      </Text>
    </XStack>
  )
}