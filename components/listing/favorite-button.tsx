import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@tamagui/core'
import * as Haptics from 'expo-haptics'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Button, Text, XStack } from 'tamagui'
import { useFavoriteListing, useUnfavoriteListing } from '../../hooks/queries/use-listing'
import { useFavoriteStatus } from '../../hooks/use-favorite'

interface FavoriteButtonProps {
  listingId: string
  initialCount: number
  size?: 'small' | 'medium' | 'large'
  debounceMs?: number
}

/**
 * Favorite button component with optimistic updates and haptic feedback.
 * Shows heart icon that fills/unfills when tapped, with live count updates.
 * When count is 0, shows only circular favorite button. When count > 0, shows count next to heart.
 * Debounces API calls to prevent spam tapping.
 * Automatically detects favorite status from user's favorites list.
 */
export function FavoriteButton({ 
  listingId, 
  initialCount, 
  size = 'medium',
  debounceMs = 500
}: FavoriteButtonProps) {
  const theme = useTheme()
  
  // Get favorite status and count from the favorites list
  const { isFavorited: serverIsFavorited, favoritesCount: serverCount, isLoading: favoritesLoading } = useFavoriteStatus(listingId, initialCount)
  
  // Mutation hooks
  const favoriteMutation = useFavoriteListing()
  const unfavoriteMutation = useUnfavoriteListing()
  
  // Local optimistic state - initialize with server values
  const [isFavorited, setIsFavorited] = useState(serverIsFavorited)
  const [count, setCount] = useState(serverCount)
  const [isLoading, setIsLoading] = useState(false)
  
  // Update local state when server state changes, but only if there's no pending operation
  useEffect(() => {
    setIsFavorited(serverIsFavorited)
  }, [serverIsFavorited])
  
  // Update count from mutation responses
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
  
  // Track the pending state to determine which API call to make
  const pendingStateRef = useRef<boolean | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const executeApiCall = useCallback(async (shouldFavorite: boolean) => {
    setIsLoading(true)
    
    try {
      if (shouldFavorite) {
        await favoriteMutation.mutateAsync(listingId)
      } else {
        await unfavoriteMutation.mutateAsync(listingId)
      }
    } catch (error) {
      // Only revert if this is still the pending operation
      // If user clicked again, pendingStateRef.current will be different
      if (pendingStateRef.current === shouldFavorite) {
        // Revert optimistic update on error
        setIsFavorited(!shouldFavorite)
        setCount(prev => shouldFavorite ? prev - 1 : prev + 1)
      }
      console.error('Failed to toggle favorite:', error)
    } finally {
      setIsLoading(false)
      // Only clear if this was the pending operation
      if (pendingStateRef.current === shouldFavorite) {
        pendingStateRef.current = null
      }
    }
  }, [listingId, favoriteMutation, unfavoriteMutation])

  const handleToggle = async () => {
    // Only prevent clicks while initial favorites are loading
    // Allow clicks even during API execution for continuous responsiveness
    if (favoritesLoading) return

    const newIsFavorited = !isFavorited
    
    // Optimistic update
    setIsFavorited(newIsFavorited)
    setCount(prev => newIsFavorited ? prev + 1 : prev - 1)
    
    // Haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    
    // Update pending state
    pendingStateRef.current = newIsFavorited
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    // Set new timeout for API call
    timeoutRef.current = setTimeout(() => {
      const finalState = pendingStateRef.current
      if (finalState !== null) {
        executeApiCall(finalState)
      }
    }, debounceMs)
  }

  // Clean up timeout on unmount
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
  
  // Only disable while favorites are loading initially
  // Don't disable during mutations - we want rapid tapping to work
  const isDisabled = favoritesLoading

  // If count is 0, show circular button only
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

  // If count > 0, show button with count
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