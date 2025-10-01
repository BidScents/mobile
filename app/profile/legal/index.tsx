import { LegalDocumentsBottomSheet, LegalDocumentsBottomSheetMethods } from '@/components/forms/legal-documents-bottom-sheet'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { ThemedIonicons } from '@/components/ui/themed-icons'
import { router } from 'expo-router'
import React, { useRef, useEffect } from 'react'
import { Text, YStack, XStack } from 'tamagui'

export default function LegalScreen() {
  const legalBottomSheetRef = useRef<LegalDocumentsBottomSheetMethods>(null)

  // Open the bottom sheet when the screen loads
  useEffect(() => {
    legalBottomSheetRef.current?.present()
  }, [])

  const handleGoBack = () => {
    router.back()
  }

  const handleTermsPress = () => {
    legalBottomSheetRef.current?.presentWithTab('terms')
  }

  const handlePrivacyPress = () => {
    legalBottomSheetRef.current?.presentWithTab('privacy')
  }

  return (
    <Container variant="padded" safeArea backgroundColor="$background">
      <YStack gap="$5" flex={1}>
        {/* Header */}
        <XStack alignItems="center" gap="$3">
          <Button 
            variant="secondary" 
            iconOnly 
            onPress={handleGoBack} 
            leftIcon="arrow-back"
          />
          <Text fontSize="$7" fontWeight="600" color="$foreground">
            Legal Documents
          </Text>
        </XStack>

        {/* Document Options */}
        <YStack gap="$4" flex={1}>
          <Text color="$mutedForeground" fontSize="$4" lineHeight="$5">
            Review our legal documents to understand how we protect your privacy and outline our terms of service.
          </Text>

          <YStack gap="$3">
            <XStack
              alignItems="center"
              justifyContent="space-between"
              bg="$muted"
              borderRadius="$6"
              px="$4"
              py="$4"
              onPress={handlePrivacyPress}
              pressStyle={{
                backgroundColor: "$mutedPress",
              }}
            >
              <XStack alignItems="center" gap="$3">
                <ThemedIonicons
                  name="shield-checkmark-outline"
                  size={24}
                  color="$foreground"
                />
                <YStack>
                  <Text fontSize="$5" fontWeight="500" color="$foreground">
                    Privacy Policy
                  </Text>
                  <Text fontSize="$3" color="$mutedForeground">
                    How we collect and use your information
                  </Text>
                </YStack>
              </XStack>
              <ThemedIonicons
                name="chevron-forward"
                size={20}
                color="$mutedForeground"
              />
            </XStack>

            <XStack
              alignItems="center"
              justifyContent="space-between"
              bg="$muted"
              borderRadius="$6"
              px="$4"
              py="$4"
              onPress={handleTermsPress}
              pressStyle={{
                backgroundColor: "$mutedPress",
              }}
            >
              <XStack alignItems="center" gap="$3">
                <ThemedIonicons
                  name="document-text-outline"
                  size={24}
                  color="$foreground"
                />
                <YStack>
                  <Text fontSize="$5" fontWeight="500" color="$foreground">
                    Terms of Service
                  </Text>
                  <Text fontSize="$3" color="$mutedForeground">
                    Rules and guidelines for using BidScents
                  </Text>
                </YStack>
              </XStack>
              <ThemedIonicons
                name="chevron-forward"
                size={20}
                color="$mutedForeground"
              />
            </XStack>
          </YStack>
        </YStack>
      </YStack>

      {/* Legal Documents Bottom Sheet */}
      <LegalDocumentsBottomSheet ref={legalBottomSheetRef} />
    </Container>
  )
}