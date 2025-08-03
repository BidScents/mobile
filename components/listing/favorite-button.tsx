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
 * Simplified favorite button with optimistic updates and debouncing.
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
  
  // Sync with server state
  useEffect(() => {
    setIsFavorited(serverIsFavorited)
  }, [serverIsFavorited])
  
  // Update count from successful mutations
  useEffect(() => {
    if (favoriteMutation.data) {
      setCount(favoriteMutation.data.favorites_count)
    }
  }, [favoriteMutation.data])
  
  useEffect(() => {
    if (unfavoriteMutation.data) {
      setCount(unfavoriteMutation.data.favorites_count)
    }
  }, [unfavoriteMutation.data])
  
  // Debouncing logic
  const pendingStateRef = useRef<boolean | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const executeApiCall = useCallback(async (shouldFavorite: boolean) => {
    try {
      if (shouldFavorite) {
        await favoriteMutation.mutateAsync(listingId)
      } else {
        await unfavoriteMutation.mutateAsync(listingId)
      }
    } catch (error) {
      // Simple error handling - just revert the optimistic update
      setIsFavorited(!shouldFavorite)
      setCount(prev => shouldFavorite ? prev - 1 : prev + 1)
      console.error('Failed to toggle favorite:', error)
    } finally {
      pendingStateRef.current = null
    }
  }, [listingId, favoriteMutation, unfavoriteMutation])

  const handleToggle = async () => {
    if (favoritesLoading) return

    const newIsFavorited = !isFavorited
    
    // Immediate optimistic update
    setIsFavorited(newIsFavorited)
    setCount(prev => newIsFavorited ? prev + 1 : prev - 1)
    
    // Haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    
    // Debounced API call
    pendingStateRef.current = newIsFavorited
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    timeoutRef.current = setTimeout(() => {
      const finalState = pendingStateRef.current
      if (finalState !== null) {
        executeApiCall(finalState)
      }
    }, debounceMs)
  }

  // Cleanup
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
    large: '$5'
  }[size]

  const heartColor = isFavorited ? 'red' : (theme.foreground?.val || '#000')
  const isDisabled = favoritesLoading

  // Show just icon if count is 0
  if (count === 0) {
    return (
      <Button
        size="$2"
        borderRadius="$5"
        backgroundColor="$muted"
        onPress={handleToggle}
        disabled={isDisabled}
        opacity={isDisabled ? 0.6 : 1}
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
      size="$2"
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