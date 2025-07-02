import { LoginBottomSheet } from '@/components/auth/login-bottom-sheet'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types'
import React, { useCallback, useRef } from 'react'
import { H1, Text, YStack } from 'tamagui'

export default function WelcomeScreen() {
  const loginSheetRef = useRef<BottomSheetModalMethods>(null)

  const handleGetStarted = useCallback(() => {
    loginSheetRef.current?.present()
  }, [])

  return (
    <Container backgroundColor="$background">
      <YStack 
        flex={1} 
        justifyContent="space-between" 
        padding="$5"
        paddingBottom="$3"
        alignItems="center"
      >
        {/* Illustration Section */}
        <YStack alignItems="center" flex={1} justifyContent="center">

        </YStack>

        {/* CTA Section */}
        <YStack width="100%" gap="$7">
          <YStack alignItems="center" gap="$1">
            <H1 
              color="$foreground" 
              textAlign="center" 
              fontSize="$10"
              fontWeight="$3"
            >
              BidScents
            </H1>
            
            <Text 
              color="$mutedForeground" 
              textAlign="center" 
              fontSize="$5"
              lineHeight="$6"
            >
              Buy, sell, swap your favorite scents
            </Text>
          </YStack>

          <Button
            variant="primary"
            size="lg"
            borderRadius="$10"
            fullWidth
            onPress={handleGetStarted}
          >
            Get Started
          </Button>
        </YStack>
      </YStack>

      <LoginBottomSheet ref={loginSheetRef} />
    </Container>
  )
}