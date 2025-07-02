// src/components/auth/login-bottom-sheet.tsx
import { BottomSheet } from '@/components/ui/bottom-sheet'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { AuthService, handleAuthStateChange } from '@bid-scents/shared-sdk'
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types'
import { makeRedirectUri } from 'expo-auth-session'
import { router } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import React, { forwardRef, useImperativeHandle, useState } from 'react'
import { Alert, Linking } from 'react-native'
import { Text, XStack, YStack } from 'tamagui'

WebBrowser.maybeCompleteAuthSession()

interface LoginBottomSheetMethods extends BottomSheetModalMethods {
  dismiss: () => void
}

/**
 * Login options bottom sheet that properly dismisses after navigation.
 * Provides email, and social authentication options.
 */
export const LoginBottomSheet = forwardRef<LoginBottomSheetMethods>((props, ref) => {
  const [isLoading, setIsLoading] = useState(false)
  const bottomSheetRef = React.useRef<BottomSheetModalMethods>(null)

  useImperativeHandle(ref, () => ({
    present: () => bottomSheetRef.current?.present(),
    dismiss: () => bottomSheetRef.current?.dismiss(),
    close: () => bottomSheetRef.current?.close(),
    collapse: () => bottomSheetRef.current?.collapse(),
    expand: () => bottomSheetRef.current?.expand(),
    snapToIndex: (index: number) => bottomSheetRef.current?.snapToIndex(index),
    snapToPosition: (position: string | number) => bottomSheetRef.current?.snapToPosition(position),
    forceClose: () => bottomSheetRef.current?.forceClose(),
  }))

  const dismissAndNavigate = (route: string) => {
    router.push(route as any)
    bottomSheetRef.current?.dismiss()
  }

  const handleAuthSuccess = async (session: any) => {
    try {
      handleAuthStateChange('SIGNED_IN', session)
      const loginResult = await AuthService.loginV1AuthLoginGet()
      
      if (loginResult.onboarded) {
        router.replace('/(tabs)/')
      } else {
        router.replace('/(auth)/onboarding')
      }
      bottomSheetRef.current?.dismiss()
    } catch (error) {
      console.error('Auth success handling failed:', error)
      Alert.alert('Error', 'Something went wrong. Please try again.')
    }
  }

  const handleOAuthSignIn = async (provider: 'google' | 'facebook') => {
    setIsLoading(true)
    try {
      const redirectTo = makeRedirectUri()
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      })

      if (error) throw error

      if (data.url) {
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo)
        
        if (result.type === 'success') {
          const url = new URL(result.url)
          const access_token = url.searchParams.get('access_token')
          const refresh_token = url.searchParams.get('refresh_token')

          if (access_token && refresh_token) {
            const { data: sessionData, error: sessionError } = 
              await supabase.auth.setSession({ access_token, refresh_token })

            if (sessionError) throw sessionError
            if (sessionData.session) {
              await handleAuthSuccess(sessionData.session)
            }
          }
        }
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || `Failed to sign in with ${provider}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTermsPress = async () => {
    try {
      // Replace with your actual Terms of Service URL
      const termsUrl = 'https://bidscents.com/terms-of-service'
      
      // Check if the device can open the URL
      const canOpen = await Linking.canOpenURL(termsUrl)
      
      if (canOpen) {
        await Linking.openURL(termsUrl)
      } else {
        Alert.alert('Error', 'Unable to open Terms of Service')
      }
    } catch (error) {
      console.error('Failed to open Terms of Service:', error)
      Alert.alert('Error', 'Unable to open Terms of Service')
    }
  }

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={['60%', '80%']}
      backgroundStyle={{ backgroundColor: 'white' }}
    >
      <YStack gap="$5" padding="$4" paddingBottom="$8" >
        {/* Header */}
        <YStack gap="$2">
          <Text 
            textAlign="left" 
            fontSize="$7" 
            fontWeight="$3"
            color="$foreground"
          >
            Get Started
          </Text>
          <Text 
            textAlign="left" 
            color="$mutedForeground" 
            fontSize="$4"
            lineHeight="$5"
          >
            Register to buy, sell, swap your favorite scents and much more with your account.
          </Text>
        </YStack>

        {/* Main Action Buttons */}
        <YStack gap="$3" alignItems="center">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onPress={() => dismissAndNavigate('/(auth)/email-login')}
            disabled={isLoading}
          >
            Continue with Email
          </Button>

          <XStack alignItems="center" gap="$3">
            <Button
                variant="secondary"
                size="lg"
                iconOnly
                leftIcon="logo-google"
                flex={1}
                onPress={() => handleOAuthSignIn('google')}
                disabled={isLoading}
              />

              <Button
                variant="secondary"
                size="lg"
                iconOnly
                flex={1}
                leftIcon="logo-facebook"
                onPress={() => handleOAuthSignIn('facebook')}
                disabled={isLoading}
              />
          </XStack>

        </YStack>

        {/* Footer with clickable Terms of Service */}
        <XStack justifyContent="center" alignItems="center">
          <Text 
            textAlign="center" 
            color="$mutedForeground" 
            fontSize="$3"
          >
            By continuing, you agree to our{' '}
          </Text>
          <Text
            textAlign="center"
            color="$foreground"
            fontSize="$3"
            textDecorationLine="underline"
            onPress={handleTermsPress}
            cursor="pointer"
          >
            Terms of Service
          </Text>
        </XStack>
      </YStack>
    </BottomSheet>
  )
})

LoginBottomSheet.displayName = 'LoginBottomSheet'