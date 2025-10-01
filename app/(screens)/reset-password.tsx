import { ControlledInput } from '@/components/forms/controlled-input'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { KeyboardAwareView } from '@/components/ui/keyboard-aware-view'
import { supabase } from '@/lib/supabase'
import {
  resetPasswordSchema,
  type ResetPasswordFormData
} from '@/schemas/forgot-password.schemas'
import { useLoadingStore } from '@bid-scents/shared-sdk'
import { zodResolver } from '@hookform/resolvers/zod'
import { router } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Alert, ScrollView } from 'react-native'
import { Text, XStack, YStack } from 'tamagui'

/**
 * Default form values for password reset
 */
const DEFAULT_VALUES: ResetPasswordFormData = {
  password: '',
  confirmPassword: ''
}

export default function ResetPasswordScreen() {
  const [isLoading, setIsLoading] = useState(false)
  const { hideLoading } = useLoadingStore()

  // Form setup
  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onBlur',
    defaultValues: DEFAULT_VALUES
  })

  // Hide loading overlay when component mounts (handoff from deep link)
  useEffect(() => {
    hideLoading()
  }, [])

  /**
   * Handle password reset submission
   */
  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true)
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password
      })

      if (error) {
        Alert.alert(
          'Update Failed',
          error.message || 'Unable to update your password. Please try again.'
        )
        return
      }
      
      Alert.alert(
        'Password Updated',
        'Your password has been successfully updated. You can now use your new password to sign in.',
        [{ 
          text: 'Continue', 
          onPress: () => router.replace('/(tabs)/home/')
        }]
      )
    } catch (error: any) {
      Alert.alert(
        'Update Failed',
        'An error occurred while updating your password. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Navigate back to home
   */
  const goToHome = () => {

    router.dismissTo('/(tabs)/home/')
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
                onPress={goToHome} 
                leftIcon="arrow-back"
                disabled={isLoading}
              />
              
              <YStack gap="$2">
                <Text color="$foreground" fontSize="$8" fontWeight="600">
                  Reset Password
                </Text>
                
                <Text color="$mutedForeground" fontSize="$4" maxWidth={280} lineHeight="$4">
                  Enter your new password below.
                </Text>
              </YStack>
            </YStack>

            {/* Form Section */}
            <YStack gap="$4" flex={1}>
              <ControlledInput
                control={form.control}
                name="password"
                variant="password"
                label="New Password"
                placeholder="Enter your new password"
                disabled={isLoading}
              />

              <ControlledInput
                control={form.control}
                name="confirmPassword"
                variant="password"
                label="Confirm New Password"
                placeholder="Confirm your new password"
                disabled={isLoading}
              />
            </YStack>

            {/* Navigation Section */}
            <YStack gap="$1" paddingBottom="$6">
              <Text color="$mutedForeground" fontSize="$3" textAlign="center">
                Changed your mind?
              </Text>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onPress={goToHome} 
                disabled={isLoading}
              >
                Back to Home
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
            disabled={isLoading}
            borderRadius="$10"
          >
            {isLoading ? 'Updating...' : 'Update Password'}
          </Button>
        </XStack>
      </KeyboardAwareView>
    </Container>
  )
}