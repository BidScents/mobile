/**
 * Email Confirmation Handler
 * 
 * Handles email confirmation deep links. Since Supabase automatically
 * authenticates users when they click confirmation links, we just need
 * to check if they have a valid session and navigate accordingly.
 * 
 * Flow:
 * 1. User clicks email confirmation link
 * 2. Supabase confirms email and creates session
 * 3. Redirects to app with success/error info
 * 4. Check current session and navigate appropriately
 */

import { Container } from '@/components/ui/container'
import { supabase } from '@/lib/supabase'
import { handleAuthSuccess } from '@/utils/auth-actions'
import { useLoadingStore } from '@bid-scents/shared-sdk'
import { router, useLocalSearchParams } from 'expo-router'
import React, { useEffect, useRef } from 'react'
import { Alert } from 'react-native'
import { Spinner, Text, YStack } from 'tamagui'

export default function EmailConfirmationHandler() {
  const params = useLocalSearchParams()
  const { showLoading, hideLoading } = useLoadingStore()
  const hasProcessed = useRef(false)

  useEffect(() => {
    if (hasProcessed.current) return
    hasProcessed.current = true

    const handleEmailConfirmation = async () => {
      try {
        showLoading()

        // Check for error parameters in URL
        if (params.error) {
          handleConfirmationError()
          return
        }

        // Check if user now has a valid session (they should after email confirmation)
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          // User is authenticated - proceed with app flow
          await handleAuthSuccess(session)
        } else {
          // No session but no error - email confirmed successfully
          showConfirmationSuccess()
        }

      } catch (error: any) {
        handleConfirmationError()
      } finally {
        hideLoading()
      }
    }

    const timer = setTimeout(handleEmailConfirmation, 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <Container backgroundColor="$background" flex={1}>
      <YStack 
        flex={1} 
        justifyContent="center" 
        alignItems="center" 
        gap="$4"
        paddingHorizontal="$6"
      >
        <YStack
          backgroundColor="$background"
          padding="$6"
          borderRadius="$6"
          alignItems="center"
          gap="$4"
          shadowColor="$shadowColor"
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.1}
          shadowRadius={8}
          elevationAndroid={4}
        >
          <Spinner size="large" color="$foreground" />
          
          <YStack alignItems="center" gap="$2">
            <Text 
              fontSize="$6" 
              fontWeight="600" 
              color="$foreground"
              textAlign="center"
            >
              Confirming Email
            </Text>
            
            <Text 
              fontSize="$4" 
              color="$mutedForeground" 
              textAlign="center"
              maxWidth={200}
            >
              Please wait while we verify your email address
            </Text>
          </YStack>
        </YStack>
      </YStack>
    </Container>
  )
}

/**
 * Shows success message when email is confirmed but user needs to sign in
 */
function showConfirmationSuccess() {
  Alert.alert(
    'Email Confirmed',
    'Your email has been confirmed successfully. Please sign in to continue.',
    [{
      text: 'Sign In',
      onPress: () => router.replace({
        pathname: '/(auth)/login',
        params: { from: 'email-confirm' }
      })
    }]
  )
}

/**
 * Handles confirmation errors (expired links, etc.)
 */
function handleConfirmationError() {
  Alert.alert(
    'Confirmation Failed',
    'Unable to confirm your email. The link may have expired. Please request a new confirmation email.',
    [{
      text: 'OK',
      onPress: () => router.replace('/(auth)/sign-up')
    }]
  )
}