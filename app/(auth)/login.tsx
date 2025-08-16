/**
 * Login Screen Component
 * 
 * Handles user authentication with email and password.
 * Features:
 * - Form validation with Zod schema
 * - Real-time form state management
 * - Comprehensive error handling with specific messages
 * - Loading states and user feedback
 * - Navigation between auth screens
 * - Forgot password placeholder
 */

import { ControlledInput } from '@/components/forms/controlled-input'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { KeyboardAwareView } from '@/components/ui/keyboard-aware-view'
import { handleForgotPassword, handleLogin } from '@/utils/auth-actions'
import { loginSchema, type LoginFormData } from '@bid-scents/shared-sdk'
import { zodResolver } from '@hookform/resolvers/zod'
import { router } from 'expo-router'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { ScrollView } from 'react-native'
import { Text, XStack, YStack } from 'tamagui'

/**
 * Default form values for login
 */
const DEFAULT_VALUES: LoginFormData = {
  email: '',
  password: ''
}

export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { isValid }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    defaultValues: DEFAULT_VALUES
  })

  /**
   * Handle form submission
   * 
   * Validates form data and attempts to authenticate user.
   * Manages loading state and delegates auth logic to utility function.
   */
  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    
    try {
      await handleLogin(data)
    } catch (error) {
      // Error handling is done in the utility function
      // Loading state is cleared here regardless of outcome
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Navigate to sign up screen
   */
  const navigateToSignUp = () => {
    router.replace('/(auth)/sign-up')
  }

  /**
   * Navigate back to previous screen
   */
  const goBack = () => {
    router.replace('/(auth)')
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
                onPress={goBack} 
                leftIcon="arrow-back"
                disabled={isLoading}
              />
              
              <YStack gap="$2">
                <Text color="$foreground" fontSize="$8" fontWeight="600">
                  Welcome Back
                </Text>
                
                <Text color="$mutedForeground" fontSize="$4" maxWidth={280} lineHeight="$4">
                  Sign in to your account to continue exploring premium fragrances.
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
                placeholder="Enter your password"
                disabled={isLoading}
              />

              {/* Forgot Password Link */}
              <XStack justifyContent="flex-end">
                <Text 
                  color="$foreground" 
                  fontSize="$3"
                  onPress={handleForgotPassword}
                  disabled={isLoading}
                >
                  Forgot Password?
                </Text>
              </XStack>
            </YStack>

            {/* Navigation Section */}
            <YStack gap="$1" paddingBottom="$6">
              <Text color="$mutedForeground" fontSize="$3" textAlign="center">
                Don&apos;t have an account?
              </Text>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onPress={navigateToSignUp} 
                disabled={isLoading}
              >
                Create Account
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
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
        </XStack>
      </KeyboardAwareView>
    </Container>
  )
}