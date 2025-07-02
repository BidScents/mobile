import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import React, { useState } from 'react'
import { Button, Text, XStack } from 'tamagui'

interface FavoriteButtonProps {
  listingId: string
  initialCount: number
  initialIsFavorited?: boolean
  onToggle?: (listingId: string, isFavorited: boolean) => void
  size?: 'small' | 'medium' | 'large'
}

/**
 * Favorite button component with optimistic updates and haptic feedback.
 * Shows heart icon that fills/unfills when tapped, with live count updates.
 * When count is 0, shows only circular favorite button. When count > 0, shows count next to heart.
 */
export function FavoriteButton({ 
  listingId, 
  initialCount, 
  initialIsFavorited = false,
  onToggle,
  size = 'medium'
}: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited)
  const [count, setCount] = useState(initialCount)
  const [isLoading, setIsLoading] = useState(false)

  const handleToggle = async () => {
    if (isLoading) return

    // Optimistic update
    const newIsFavorited = !isFavorited
    setIsFavorited(newIsFavorited)
    setCount(prev => newIsFavorited ? prev + 1 : prev - 1)
    
    // Haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    
    setIsLoading(true)
    
    try {
      // TODO: Call actual API when ready
      // await toggleFavoriteAPI(listingId, newIsFavorited)
      
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 500))
      
      onToggle?.(listingId, newIsFavorited)
    } catch (error) {
      // Revert optimistic update on error
      setIsFavorited(!newIsFavorited)
      setCount(prev => newIsFavorited ? prev - 1 : prev + 1)
      console.error('Failed to toggle favorite:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const iconSize = {
    small: 16,
    medium: 20,
    large: 24
  }[size]

  const textSize = {
    small: '$3',
    medium: '$4',
    large: '$5'
  }[size]

  // If count is 0, show circular button only
  if (count === 0) {
    return (
      <Button
        size="$2"
        borderRadius={'$5'}

        backgroundColor='$muted'
        onPress={handleToggle}
        disabled={isLoading}
        opacity={isLoading ? 0.6 : 1}
      >
        <Ionicons 
          name={isFavorited ? "heart" : "heart-outline"}
          size={iconSize} 
          color={isFavorited ? 'red' : 'black'}
        />
      </Button>
    )
  }

  // If count > 0, show button with count
  return (
    <Button
      size="$2"
      backgroundColor='$muted'
      onPress={handleToggle}
      disabled={isLoading}
      opacity={isLoading ? 0.6 : 1}
      borderRadius="$5"
      paddingHorizontal="$2"
      paddingVertical="$1"
      alignItems="center"
    >
      <XStack alignItems="center" gap="$1">
        <Ionicons 
          name={isFavorited ? "heart" : "heart-outline"}
          size={iconSize} 
          color={isFavorited ? 'red' : 'black'}
        />
        <Text 
          fontSize={textSize} 
          color="$foreground"
          fontWeight="500"
        >
          {count}
        </Text>
      </XStack>
    </Button>
  )
}