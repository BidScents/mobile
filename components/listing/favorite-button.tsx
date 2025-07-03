import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@tamagui/core'
import * as Haptics from 'expo-haptics'
import React, { useCallback, useRef, useState } from 'react'
import { Button, Text, XStack } from 'tamagui'

interface FavoriteButtonProps {
 listingId: string
 initialCount: number
 initialIsFavorited?: boolean
 onFavorite?: (listingId: string) => Promise<void>
 onUnfavorite?: (listingId: string) => Promise<void>
 size?: 'small' | 'medium' | 'large'
 debounceMs?: number
}

/**
* Favorite button component with optimistic updates and haptic feedback.
* Shows heart icon that fills/unfills when tapped, with live count updates.
* When count is 0, shows only circular favorite button. When count > 0, shows count next to heart.
* Debounces API calls to prevent spam tapping.
*/
export function FavoriteButton({ 
 listingId, 
 initialCount, 
 initialIsFavorited = false,
 onFavorite,
 onUnfavorite,
 size = 'medium',
 debounceMs = 500
}: FavoriteButtonProps) {
 const theme = useTheme()
 const [isFavorited, setIsFavorited] = useState(initialIsFavorited)
 const [count, setCount] = useState(initialCount)
 const [isLoading, setIsLoading] = useState(false)
 
 // Track the pending state to determine which API call to make
 const pendingStateRef = useRef<boolean | null>(null)
 const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

 const executeApiCall = useCallback(async (shouldFavorite: boolean) => {
   setIsLoading(true)
   
   try {
     if (shouldFavorite) {
       await onFavorite?.(listingId)
     } else {
       await onUnfavorite?.(listingId)
     }
   } catch (error) {
     // Revert optimistic update on error
     setIsFavorited(!shouldFavorite)
     setCount(prev => shouldFavorite ? prev - 1 : prev + 1)
     console.error('Failed to toggle favorite:', error)
   } finally {
     setIsLoading(false)
     pendingStateRef.current = null
   }
 }, [listingId, onFavorite, onUnfavorite])

 const handleToggle = async () => {
   if (isLoading) return

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

 // If count is 0, show circular button only
 if (count === 0) {
   return (
     <Button
       size="$2"
       borderRadius="$5"
       backgroundColor="$muted"
       onPress={handleToggle}
       disabled={isLoading}
       opacity={isLoading ? 0.6 : 1}
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