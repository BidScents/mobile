/**
 * Authentication action utilities
 * 
 * Helper functions for handling user authentication actions like sign up, login, etc.
 * Manages Supabase auth operations and error handling.
 */

import { supabase } from '@/lib/supabase'
import { AuthService, handleAuthStateChange, type LoginFormData, type SignUpFormData } from '@bid-scents/shared-sdk'
import { router } from 'expo-router'
import { Alert } from 'react-native'

/**
 * Handle user sign up with email and password
 * 
 * Attempts to create a new user account and handles various response scenarios:
 * - Email confirmation required → Navigate to confirmation screen
 * - Immediate sign in → Navigate to onboarding
 * - Account exists → Show login option
 * - Rate limiting → Show retry message
 */
export const handleSignUp = async (data: SignUpFormData) => {
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
    handleSignUpError(error)
    throw error // Re-throw to let component handle loading state
  }
}

/**
 * Handle sign up errors with appropriate user feedback
 * 
 * Provides specific error messages and actions based on error type:
 * - User already exists → Offer to navigate to login
 * - Rate limiting → Show retry message
 * - Generic errors → Show error message
 */
export const handleSignUpError = (error: any) => {
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
}


/**
 * Handle user login with email and password
 * 
 * Attempts to sign in user and determines next navigation step:
 * - Successful login → Check onboarding status via API
 * - Onboarded user → Navigate to main app
 * - New user → Navigate to onboarding
 * - API failure → Assume onboarding needed
 */
export const handleLogin = async (data: LoginFormData) => {
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
      handleLoginError(error)
      throw error // Re-throw to let component handle loading state
    }
  }
  
  /**
   * Handle successful authentication
   * 
   * Syncs session with SDK and determines user's onboarding status
   * to navigate to appropriate screen
   */
  export const handleAuthSuccess = async (session: any) => {
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
  
  /**
   * Handle login errors with appropriate user feedback
   * 
   * Provides specific error messages based on error type:
   * - Invalid credentials → Show credential error
   * - Email not confirmed → Show confirmation message
   * - Rate limiting → Show retry message
   * - Generic errors → Show error message
   */
  export const handleLoginError = (error: any) => {
    if (error.message?.includes('Invalid login credentials')) {
      Alert.alert('Invalid Credentials', 'Please check your email and password and try again.')
    } else if (error.message?.includes('Email not confirmed')) {
      Alert.alert('Email Not Confirmed', 'Please check your email and click the confirmation link before signing in.')
    } else if (error.message?.includes('too many requests')) {
      Alert.alert('Too Many Attempts', 'Please wait a moment before trying again.')
    } else {
      Alert.alert('Authentication Error', error.message || 'Failed to sign in')
    }
  }
  
  /**
   * Handle forgot password action
   * 
   * Placeholder for future forgot password functionality
   */
  export const handleForgotPassword = () => {
    Alert.alert('Forgot Password', 'This feature will be available soon.')
  }