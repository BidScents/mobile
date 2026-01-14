import { LoginBottomSheet } from '@/components/auth/login-bottom-sheet'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { useIntro } from '@/hooks/use-intro'
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types'
import { router } from 'expo-router'
import LottieView from 'lottie-react-native'
import React, { useCallback, useRef } from 'react'
import { H1, Text, YStack } from 'tamagui'

export default function WelcomeScreen() {
  const loginSheetRef = useRef<BottomSheetModalMethods>(null)
  const { hasSeenIntro, isLoading: isIntroLoading } = useIntro();

  const handleGetStarted = useCallback(() => {
    if (!isIntroLoading && hasSeenIntro === false) {
      router.push('/welcome');
    } else {
      loginSheetRef.current?.present();
    }
  }, [isIntroLoading, hasSeenIntro]);

  return (
    <Container backgroundColor="$background" variant="padded">
      <YStack 
        flex={1} 
        justifyContent="space-between" 
        alignItems="center"
      >
        {/* Illustration Section */}
        <YStack alignItems="center" flex={1} justifyContent="center">
          <LottieView
            autoPlay
            loop
            source={require('@/assets/videos/Wonder Things.json')}
            style={{
              width: 350,
              height: 350,
            }}
          />
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
              Buy, sell, and swap your favorite scents
            </Text>
          </YStack>
          
          <YStack alignItems="center" gap="$2">
            <Button
              variant="primary"
              size="lg"
              borderRadius="$6"
              fullWidth
              onPress={handleGetStarted}
            >
              Get Started
            </Button>

            <Button
              variant="ghost"
              size="lg"
              borderRadius="$6"
              fullWidth
              onPress={() => router.replace('/(tabs)/home')}
            >
              Skip
            </Button>
          </YStack>
        </YStack>
      </YStack>

      <LoginBottomSheet ref={loginSheetRef} />
    </Container>
  )
}