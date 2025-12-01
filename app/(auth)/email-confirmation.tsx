import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { ThemedIonicons } from '@/components/ui/themed-icons'
import { router, useLocalSearchParams } from 'expo-router'
import React from 'react'
import { Text, YStack } from 'tamagui'

export default function EmailConfirmationScreen() {
  const { email } = useLocalSearchParams<{ email: string }>()

  const backToSignIn = () => {
    router.replace('/(auth)/login')
  }

  return (
    <Container backgroundColor="$background" safeArea={['top']} variant='padded'>
      <YStack flex={1} justifyContent="center" gap="$6" alignItems="center">
          <ThemedIonicons name="mail" size={64} />
          
          <YStack gap="$2" alignItems="center">
            <Text color="$foreground" fontSize="$8" fontWeight="600" textAlign="center">
              Check Your Email
            </Text>
            
            <Text color="$mutedForeground" fontSize="$4" textAlign="center" lineHeight="$4">
              We sent a confirmation link to{'\n'}
              <Text fontWeight="500">{email}</Text>
            </Text>
          </YStack>
      </YStack>
        <YStack gap="$4" paddingBottom="$4">
            <Text color="$mutedForeground" fontSize="$3" textAlign="center" lineHeight="$3">
            Click the link in your email to confirm your account, then come back here to sign in.
            </Text>

            <Button
            variant="primary"
            size="lg"
            fullWidth
            onPress={backToSignIn}
            borderRadius="$6"
            >
            Continue to Sign In
            </Button>
        </YStack>
    </Container>
  )
}