// app/(auth)/login.tsx (Improved version)
import { ControlledInput } from '@/components/forms/controlled-input'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { KeyboardAwareView } from '@/components/ui/keyboard-aware-view'
import { supabase } from '@/lib/supabase'
import { AuthService, handleAuthStateChange, loginSchema, type LoginFormData } from '@bid-scents/shared-sdk'
import { zodResolver } from '@hookform/resolvers/zod'
import { router } from 'expo-router'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Alert, ScrollView } from 'react-native'
import { Text, XStack, YStack } from 'tamagui'

export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { isValid }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: ''
    }
  })

  const handleAuthSuccess = async (session: any) => {
    try {
      handleAuthStateChange('SIGNED_IN', session)
      
      try {
        const loginResult = await AuthService.loginV1AuthLoginGet()
        
        if (loginResult.onboarded) {
          router.replace('/(tabs)')
        } else {
          router.replace('/(auth)/onboarding')
        }
      } catch (apiError) {
        console.log('API call failed, assuming new user needs onboarding:', apiError)
        router.replace('/(auth)/onboarding')
      }
    } catch (error) {
      console.error('Auth success handling failed:', error)
      Alert.alert('Error', 'Something went wrong. Please try again.')
    }
  }

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    
    try {
      const authResult = await supabase.auth.signInWithPassword({
        email: data.email.trim(),
        password: data.password,
      })

      const { data: authData, error } = authResult
      if (error) throw error

      if (authData.session) {
        await handleAuthSuccess(authData.session)
      }
    } catch (error: any) {
      console.error('Auth error:', error)
      
      if (error.message?.includes('Invalid login credentials')) {
        Alert.alert('Invalid Credentials', 'Please check your email and password and try again.')
      } else if (error.message?.includes('Email not confirmed')) {
        Alert.alert('Email Not Confirmed', 'Please check your email and click the confirmation link before signing in.')
      } else if (error.message?.includes('too many requests')) {
        Alert.alert('Too Many Attempts', 'Please wait a moment before trying again.')
      } else {
        Alert.alert('Authentication Error', error.message || 'Failed to sign in')
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
                  Welcome Back
                </Text>
                
                <Text color="$mutedForeground" fontSize="$4" maxWidth={280} lineHeight="$4">
                  Sign in to your account to continue exploring premium fragrances.
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
                placeholder="Enter your password"
                disabled={isLoading}
              />

              {/* Forgot Password Link */}
              <XStack justifyContent="flex-end">
                <Text 
                  color="$foreground" 
                  fontSize="$3"
                  onPress={() => Alert.alert('Forgot Password', 'This feature will be available soon.')}
                >
                  Forgot Password?
                </Text>
              </XStack>
            </YStack>

            {/* Actions */}
            <YStack gap="$1" paddingBottom="$6">
              <Text color="$mutedForeground" fontSize="$3" textAlign="center">
                Don&apos;t have an account?
              </Text>
              
              <Button variant="ghost" size="sm" onPress={() => router.replace('/(auth)/sign-up')} disabled={isLoading}>
                Create Account
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
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
        </XStack>
      </KeyboardAwareView>
    </Container>
  )
}