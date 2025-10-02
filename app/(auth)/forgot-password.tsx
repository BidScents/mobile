import { ControlledInput } from '@/components/forms/controlled-input'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { KeyboardAwareView } from '@/components/ui/keyboard-aware-view'
import {
  forgotPasswordRequestSchema,
  type ForgotPasswordRequestFormData
} from '@/schemas/forgot-password.schemas'
import {
  handleForgotPasswordRequestUI
} from '@/utils/auth-ui-handlers'
import { zodResolver } from '@hookform/resolvers/zod'
import { router } from 'expo-router'
import React, { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { ScrollView } from 'react-native'
import { Text, XStack, YStack } from 'tamagui'

/**
 * Default form values for forgot password request
 */
const DEFAULT_VALUES: ForgotPasswordRequestFormData = {
  email: ''
}

export default function ForgotPasswordScreen() {
  const [isLoading, setIsLoading] = useState(false)
  const [cooldownTime, setCooldownTime] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const isInCooldown = cooldownTime > 0

  // Form setup for email request
  const form = useForm<ForgotPasswordRequestFormData>({
    resolver: zodResolver(forgotPasswordRequestSchema),
    mode: 'onBlur',
    defaultValues: DEFAULT_VALUES
  })

  /**
   * Timer effect for cooldown management
   */
  useEffect(() => {
    if (cooldownTime > 0) {
      timerRef.current = setInterval(() => {
        setCooldownTime((prev) => {
          if (prev <= 1) {
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [cooldownTime])

  /**
   * Start cooldown timer
   */
  const startCooldown = () => {
    setCooldownTime(60)
  }

  /**
   * Handle forgot password request submission
   */
  const onSubmit = async (data: ForgotPasswordRequestFormData) => {
    setIsLoading(true)
    
    try {
      const success = await handleForgotPasswordRequestUI(data)
      // Start cooldown only after successful request
      if (success) {
        startCooldown()
      }
    } catch (error) {
      // Error handling is done in the utility function
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Navigate back to login screen
   */
  const goBackToLogin = () => {
    router.replace('/(auth)/login')
  }

  return (
    <Container backgroundColor="$background" safeArea={['top']} variant="padded">
      <KeyboardAwareView backgroundColor="$background">
        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <YStack flex={1} gap="$6" minHeight="100%">
            {/* Header Section */}
            <YStack gap="$6">
              <Button 
                variant="secondary" 
                iconOnly 
                onPress={goBackToLogin} 
                leftIcon="arrow-back"
                disabled={isLoading}
              />
              
              <YStack gap="$2">
                <Text color="$foreground" fontSize="$8" fontWeight="600">
                  Forgot Password
                </Text>
                
                <Text color="$mutedForeground" fontSize="$4" maxWidth={280} lineHeight="$4">
                  Enter your email address and we&apos;ll send you a link to reset your password.
                </Text>
              </YStack>
            </YStack>

            {/* Form Section */}
            <YStack gap="$4" flex={1}>
              <ControlledInput
                control={form.control}
                name="email"
                variant="email"
                label="Email Address"
                placeholder="Enter your email"
                disabled={isLoading}
              />
            </YStack>

            {/* Navigation Section */}
            <YStack gap="$1" paddingBottom="$6">
              <Text color="$mutedForeground" fontSize="$3" textAlign="center">
                Remember your password?
              </Text>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onPress={goBackToLogin} 
                disabled={isLoading}
              >
                Back to Sign In
              </Button>
            </YStack>
          </YStack>
        </ScrollView>
        
        {/* Submit Button - Fixed at bottom */}
        <XStack>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onPress={form.handleSubmit(onSubmit)}
            disabled={isLoading || isInCooldown}
            borderRadius="$10"
          >
            {isLoading 
              ? 'Sending...' 
              : isInCooldown 
                ? `Resend in ${cooldownTime}s` 
                : 'Send Reset Link'
            }
          </Button>
        </XStack>
      </KeyboardAwareView>
    </Container>
  )
}
