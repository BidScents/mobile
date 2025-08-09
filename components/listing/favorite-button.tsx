import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@tamagui/core'
import * as Haptics from 'expo-haptics'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Button, Text, XStack } from 'tamagui'
import { useFavoriteListing, useUnfavoriteListing } from '../../hooks/queries/use-listing'
import { useIsFavorited } from '../../hooks/use-favorite'

interface FavoriteButtonProps {
  listingId: string
  initialCount: number
  size?: 'small' | 'medium' | 'large'
  debounceMs?: number
}

/**
 * Simplified favorite button with optimistic updates and simple debouncing.
 * Uses only the favorites list to determine status - no detailed listing calls.
 */
export function FavoriteButton({ 
  listingId, 
  initialCount, 
  size = 'medium',
  debounceMs = 500
}: FavoriteButtonProps) {
  const theme = useTheme()
  
  // Only check if favorited - no detailed data needed
  const { isFavorited: serverIsFavorited, isLoading: favoritesLoading } = useIsFavorited(listingId)
  
  // Mutation hooks
  const favoriteMutation = useFavoriteListing()
  const unfavoriteMutation = useUnfavoriteListing()
  
  // Simple optimistic state
  const [isFavorited, setIsFavorited] = useState(serverIsFavorited)
  const [count, setCount] = useState(initialCount)
  
  // Simple debounce timeout ref
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  
  // Sync with server state
  useEffect(() => {
    setIsFavorited(serverIsFavorited)
  }, [serverIsFavorited])

  const handleToggle = useCallback(async () => {
    if (favoritesLoading) return

    const newIsFavorited = !isFavorited
    
    // Immediate optimistic update
    setIsFavorited(newIsFavorited)
    setCount(prev => newIsFavorited ? prev + 1 : prev - 1)
    
    // Haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    // Debounced API call
    timeoutRef.current = setTimeout(async () => {
      try {
        if (newIsFavorited) {
          await favoriteMutation.mutateAsync(listingId)
        } else {
          await unfavoriteMutation.mutateAsync(listingId)
        }
      } catch (error) {
        // Revert optimistic update on error
        setIsFavorited(!newIsFavorited)
        setCount(prev => newIsFavorited ? prev - 1 : prev + 1)
        console.error('Failed to toggle favorite:', error)
      }
    }, debounceMs)
  }, [isFavorited, favoritesLoading, listingId, favoriteMutation, unfavoriteMutation, debounceMs])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const iconSize = {
    small: 16,
    medium: 20,
    large: 24
  }[size]

  const textSize = {
    small: '$3',
    medium: '$4',
    large: '$6'
  }[size]

  const buttonSize = {
    small: '$2',
    medium: '$3',
    large: '$4'
  }[size]

  const heartColor = isFavorited ? 'red' : (theme.foreground?.val || '#000')
  const isDisabled = favoritesLoading

  // Show just icon if count is 0
  if (count === 0) {
    return (
      <Button
        size={buttonSize}
        borderRadius="$5"
        backgroundColor="$muted"
        onPress={handleToggle}
        disabled={isDisabled}
        opacity={isDisabled ? 0.6 : 1}
        paddingHorizontal="$2"
        paddingVertical="$1"
      >
        <Ionicons 
          name={isFavorited ? "heart" : "heart-outline"}
          size={iconSize} 
          color={heartColor}
        />
      </Button>
    )
  }

  // Show icon + count
  return (
    <Button
      size={buttonSize}
      backgroundColor="$muted"
      onPress={handleToggle}
      disabled={isDisabled}
      opacity={isDisabled ? 0.6 : 1}
      borderRadius="$5"
      paddingHorizontal="$2"
      paddingVertical="$1"
      alignItems="center"
    >
      <XStack alignItems="center" gap="$1">
        <Ionicons 
          name={isFavorited ? "heart" : "heart-outline"}
          size={iconSize} 
          color={heartColor}
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