import { LegalDocumentsBottomSheet, LegalDocumentsBottomSheetMethods } from '@/components/forms/legal-documents-bottom-sheet'
import { BottomSheet } from '@/components/ui/bottom-sheet'
import { Button } from '@/components/ui/button'
import { handleOAuthUI } from '@/utils/auth-ui-handlers'
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types'
import { router } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react'
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
  const legalBottomSheetRef = useRef<LegalDocumentsBottomSheetMethods>(null)

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
      await handleOAuthUI(provider)
      // Success handling and navigation is done in handleOAuthUI
      bottomSheetRef.current?.dismiss()
    } catch (error) {
      // Error handling is done in handleOAuthUI
    } finally {
      setIsLoading(false)
      setLoadingProvider(null)
    }
  }

  const handleTermsPress = () => {
    legalBottomSheetRef.current?.presentWithTab('terms')
  }

  const handlePrivacyPress = () => {
    legalBottomSheetRef.current?.presentWithTab('privacy')
  }

  return (
    <BottomSheet
      ref={bottomSheetRef}
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

        {/* Footer with clickable legal links */}
        <XStack justifyContent="center" alignItems="center" flexWrap="wrap" gap="$1">
          <Text 
            textAlign="center" 
            color="$mutedForeground" 
            fontSize="$3"
          >
            By continuing, you agree to our{' '}
          </Text>
          <Text
            color="$foreground"
            fontSize="$3"
            textDecorationLine="underline"
            onPress={handleTermsPress}
            cursor="pointer"
          >
            Terms of Service
          </Text>
          <Text 
            color="$mutedForeground" 
            fontSize="$3"
          >
            {' '}and{' '}
          </Text>
          <Text
            color="$foreground"
            fontSize="$3"
            textDecorationLine="underline"
            onPress={handlePrivacyPress}
            cursor="pointer"
          >
            Privacy Policy
          </Text>
        </XStack>
      </YStack>
      
      {/* Legal Documents Bottom Sheet */}
      <LegalDocumentsBottomSheet ref={legalBottomSheetRef} />
    </BottomSheet>
  )
})

LoginBottomSheet.displayName = 'LoginBottomSheet'