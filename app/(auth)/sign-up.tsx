// app/(auth)/sign-up.tsx
import { ControlledInput } from '@/components/forms/controlled-input'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { KeyboardAwareView } from '@/components/ui/keyboard-aware-view'
import { supabase } from '@/lib/supabase'
import { signUpSchema, type SignUpFormData } from '@/utils/auth-schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { router } from 'expo-router'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Alert, ScrollView } from 'react-native'
import { Text, XStack, YStack } from 'tamagui'

export default function SignUpScreen() {
  const [isLoading, setIsLoading] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { isValid }
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    mode: 'onSubmit',
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: ''
    }
  })

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true)
    
    try {
      const authResult = await supabase.auth.signUp({
        email: data.email.trim(),
        password: data.password,
      })

      const { data: authData, error } = authResult
      if (error) throw error

      if (authData.user && !authData.session) {
        // Navigate to email confirmation page
        router.replace({
          pathname: '/(auth)/email-confirmation',
          params: { email: data.email.trim() }
        })
        return
      }

      // If user is immediately signed in (email confirmation disabled)
      if (authData.session) {
        router.replace('/(auth)/onboarding')
      }
    } catch (error: any) {
      console.error('Auth error:', error)
      
      if (error.message?.includes('User already registered')) {
        Alert.alert('Account Exists', 'An account with this email already exists. Try signing in instead.', [
          { text: 'Sign In', onPress: () => router.push('/(auth)/login') },
          { text: 'Cancel', style: 'cancel' }
        ])
      } else if (error.message?.includes('too many requests')) {
        Alert.alert('Too Many Attempts', 'Please wait a moment before trying again.')
      } else {
        Alert.alert('Authentication Error', error.message || 'Failed to create account')
      }
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <Container backgroundColor="$background" safeArea={'top'} variant='padded'>
      <KeyboardAwareView backgroundColor="$background">
        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <YStack flex={1} gap="$6" minHeight="100%">
            {/* Header */}
            <YStack gap="$6">
              <Button variant='secondary' iconOnly onPress={() => router.back()} leftIcon="arrow-back"/>
              
              <YStack gap="$2">
                <Text color="$foreground" fontSize="$8" fontWeight="600">
                  Create Account
                </Text>
                
                <Text color="$mutedForeground" fontSize="$4" maxWidth={280} lineHeight="$4">
                  Join BidScents and start exploring premium fragrances from verified sellers.
                </Text>
              </YStack>
            </YStack>

            {/* Form */}
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

            {/* Actions */}
            <YStack gap="$1" paddingBottom="$6">
              <Text color="$mutedForeground" fontSize="$3" textAlign="center">
                Already have an account?
              </Text>
              
              <Button variant="ghost" size="sm" onPress={() => router.replace('/(auth)/login')} disabled={isLoading}>
                Sign In Instead
              </Button>
            </YStack>
          </YStack>
        </ScrollView>
        
        <XStack>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading || !isValid}
            borderRadius="$10"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </XStack>
      </KeyboardAwareView>
    </Container>
  )
}