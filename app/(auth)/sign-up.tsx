/**
 * Sign Up Screen Component
 * 
 * Handles new user registration with email and password.
 * Features:
 * - Form validation with Zod schema
 * - Real-time form state management
 * - Comprehensive error handling
 * - Loading states and user feedback
 * - Navigation between auth screens
 */

import { ControlledInput } from '@/components/forms/controlled-input'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { KeyboardAwareView } from '@/components/ui/keyboard-aware-view'
import { handleSignUpUI } from '@/utils/auth-ui-handlers'
import { signUpSchema, type SignUpFormData } from '@bid-scents/shared-sdk'
import { zodResolver } from '@hookform/resolvers/zod'
import { router } from 'expo-router'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { ScrollView } from 'react-native'
import { Text, XStack, YStack } from 'tamagui'

/**
 * Default form values for sign up
 */
const DEFAULT_VALUES: SignUpFormData = {
  email: '',
  password: '',
  confirmPassword: ''
}

export default function SignUpScreen() {
  const [isLoading, setIsLoading] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { isValid }
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    mode: 'onBlur',
    defaultValues: DEFAULT_VALUES
  })

  /**
   * Handle form submission
   * 
   * Validates form data and attempts to create user account.
   * Manages loading state and delegates auth logic to utility function.
   */
  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true)
    
    try {
      await handleSignUpUI(data)
    } catch (error) {
      // Error handling is done in the utility function
      // Loading state is cleared here regardless of outcome
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Navigate to login screen
   */
  const navigateToLogin = () => {
    router.replace('/(auth)/login')
  }

  /**
   * Navigate back to previous screen
   */
  const goBack = () => {
    router.replace('/(auth)')
  }
  
  return (
    <Container backgroundColor="$background" variant="padded" safeArea={['top']}>
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
                onPress={goBack} 
                leftIcon="arrow-back"
                disabled={isLoading}
              />
              
              <YStack gap="$2">
                <Text color="$foreground" fontSize="$8" fontWeight="600">
                  Create Account
                </Text>
                
                <Text color="$mutedForeground" fontSize="$4" maxWidth={280} lineHeight="$4">
                  Join BidScents and start exploring premium fragrances from verified sellers.
                </Text>
              </YStack>
            </YStack>

            {/* Form Section */}
            <YStack gap="$4" flex={1}>
              <ControlledInput
                control={control}
                name="email"
                variant="email"
                label="Email Address"
                placeholder="Enter your email"
                disabled={isLoading}
              />

              <ControlledInput
                control={control}
                name="password"
                variant="password"
                label="Password"
                placeholder="Create a strong password"
                disabled={isLoading}
              />

              <ControlledInput
                control={control}
                name="confirmPassword"
                variant="password"
                label="Confirm Password"
                placeholder="Confirm your password"
                disabled={isLoading}
              />
            </YStack>

            {/* Navigation Section */}
            <YStack gap="$1" paddingBottom="$6">
              <Text color="$mutedForeground" fontSize="$3" textAlign="center">
                Already have an account?
              </Text>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onPress={navigateToLogin} 
                disabled={isLoading}
              >
                Sign In Instead
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
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
            borderRadius="$10"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </XStack>
      </KeyboardAwareView>
    </Container>
  )
}