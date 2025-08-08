import { BottomSheet } from '@/components/ui/bottom-sheet'
import { Button } from '@/components/ui/button'
import { OAuthHandler } from '@/utils/oauth-handler'
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types'
import { router } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import React, { forwardRef, useImperativeHandle, useState } from 'react'
import { Alert, Linking } from 'react-native'
import { Text, XStack, YStack } from 'tamagui'

// Complete auth session if needed
WebBrowser.maybeCompleteAuthSession()

interface LoginBottomSheetMethods {
  present: () => void
  dismiss: () => void
}

/**
 * Login options bottom sheet with improved OAuth handling.
 * Provides email and social authentication options with proper navigation.
 */
export const LoginBottomSheet = forwardRef<LoginBottomSheetMethods>((props, ref) => {
  const [isLoading, setIsLoading] = useState(false)
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'facebook' | null>(null)
  const bottomSheetRef = React.useRef<BottomSheetModalMethods>(null)

  useImperativeHandle(ref, () => ({
    present: () => bottomSheetRef.current?.present(),
    dismiss: () => bottomSheetRef.current?.dismiss(),
  }))

  const dismissAndNavigate = (route: string) => {
    router.push(route as any)
    bottomSheetRef.current?.dismiss()
  }

  const handleOAuthSignIn = async (provider: 'google' | 'facebook') => {
    setIsLoading(true)
    setLoadingProvider(provider)
    
    try {
      await OAuthHandler.signInWithOAuth(provider)
      // Success handling and navigation is done in OAuthHandler
      bottomSheetRef.current?.dismiss()
    } catch (error) {
      // Error handling is done in OAuthHandler
    } finally {
      setIsLoading(false)
      setLoadingProvider(null)
    }
  }

  const handleTermsPress = async () => {
    try {
      const termsUrl = process.env.EXPO_PUBLIC_TERMS_URL || 'https://bidscents.com/terms-of-service'
      const canOpen = await Linking.canOpenURL(termsUrl)
      
      if (canOpen) {
        await Linking.openURL(termsUrl)
      } else {
        Alert.alert('Error', 'Unable to open Terms of Service')
      }
    } catch (error) {
      console.log('Failed to open Terms of Service:', error)
      Alert.alert('Error', 'Unable to open Terms of Service')
    }
  }

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={['60%', '80%']}
    >
      <YStack gap="$5" padding="$4" paddingBottom="$8">
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
            Register to buy, sell or swap your favorite scents and much more with your account.
          </Text>
        </YStack>

        {/* Main Action Buttons */}
        <YStack gap="$3" alignItems="center">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onPress={() => dismissAndNavigate('/(auth)/login')}
            disabled={isLoading}
          >
            Continue with Email
          </Button>

          <XStack alignItems="center" gap="$3">
            <Button
              variant="secondary"
              size="lg"
              flex={1}
              leftIcon="logo-google"
              onPress={() => handleOAuthSignIn('google')}
              disabled={isLoading}
            >
              {loadingProvider === 'google' ? 'Signing in...' : 'Google'}
            </Button>
            
            <Button
              variant="secondary"
              size="lg"
              flex={1}
              leftIcon="logo-facebook"
              onPress={() => handleOAuthSignIn('facebook')}
              disabled={isLoading}
            >
              {loadingProvider === 'facebook' ? 'Signing in...' : 'Facebook'}
            </Button>
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