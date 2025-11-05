import * as Haptics from 'expo-haptics'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Button, Text, XStack } from 'tamagui'
import { useFavoriteListing, useUnfavoriteListing } from '../../hooks/queries/use-listing'
import { useIsFavorited } from '../../hooks/use-favorite'
import { requireAuth } from '../../utils/auth-helper'
import { ThemedIonicons } from '../ui/themed-icons'

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
  // Only check if favorited - no detailed data needed
  const { isFavorited: serverIsFavorited, isLoading: favoritesLoading } = useIsFavorited(listingId)
  
  // Mutation hooks
  const favoriteMutation = useFavoriteListing()
  const unfavoriteMutation = useUnfavoriteListing()
  
  // Simple optimistic state
  const [isFavorited, setIsFavorited] = useState(serverIsFavorited)
  const [count, setCount] = useState(initialCount)
  
  // Track if we have a pending user action to prevent server state overwrites
  const hasPendingAction = useRef(false)
  
  // Simple debounce timeout ref
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  
  // Only sync with server state when we don't have pending user actions
  useEffect(() => {
    if (!hasPendingAction.current) {
      setIsFavorited(serverIsFavorited)
    }
  }, [serverIsFavorited])

  const handleToggle = useCallback(async () => {
    // Check authentication before allowing favorite action
    if (!requireAuth()) {
      return
    }

    if (favoritesLoading) return

    const newIsFavorited = !isFavorited
    
    // Mark that we have a pending action to prevent server state overwrites
    hasPendingAction.current = true
    
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
        // Clear pending action flag after successful mutation
        hasPendingAction.current = false
      } catch (error) {
        // Revert optimistic update on error
        setIsFavorited(!newIsFavorited)
        setCount(prev => newIsFavorited ? prev - 1 : prev + 1)
        // Clear pending action flag after error
        hasPendingAction.current = false
        console.error('Failed to toggle favorite:', error)
      }
    }, debounceMs)
  }, [isFavorited, favoritesLoading, listingId, favoriteMutation, unfavoriteMutation, debounceMs])

  // Cleanup timeout on unmount and clear pending action flag
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      hasPendingAction.current = false
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
        <ThemedIonicons 
          name={isFavorited ? "heart" : "heart-outline"}
          size={iconSize} 
          themeColor={isFavorited ? "red" : "foreground"}
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
        <ThemedIonicons 
          name={isFavorited ? "heart" : "heart-outline"}
          size={iconSize} 
          themeColor={isFavorited ? "red" : "foreground"}
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