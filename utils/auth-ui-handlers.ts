/**
 * Auth UI Handlers
 * 
 * UI-specific authentication handlers with error handling and user feedback.
 * Includes alerts, navigation, and user-friendly error messages.
 */

import { AuthService, type AuthResult, type OnboardingResult } from './auth-service'
import { AuthStateManager } from './auth-state-manager'
import {
  type LoginFormData,
  type OnboardingFormData,
  type SignUpFormData,
  useAuthStore
} from '@bid-scents/shared-sdk'
import { router } from 'expo-router'
import { Alert } from 'react-native'

/**
 * Handle user sign up with UI feedback
 */
export const handleSignUpUI = async (data: SignUpFormData): Promise<void> => {
  try {
    const result = await AuthService.signUp(data)

    if (result.success) {
      if (result.requiresEmailConfirmation) {
        // Navigate to email confirmation page
        router.replace({
          pathname: '/(auth)/email-confirmation',
          params: { email: result.email! }
        })
      } else if (result.session && result.user) {
        // Immediate sign in - set auth state
        AuthStateManager.setAuthenticatedState(result.session, {
          onboarded: !!result.user.onboarded_at,
          profile: result.user,
          favorites: []
        })
      }
    } else {
      handleSignUpError(result.error!)
    }
  } catch (error: any) {
    console.log('Sign up UI error:', error)
    handleSignUpError(error.message)
    throw error // Re-throw for component loading state
  }
}

/**
 * Handle user login with UI feedback
 */
export const handleLoginUI = async (data: LoginFormData): Promise<void> => {
  try {
    const result = await AuthService.signInWithPassword(data)

    if (result.success && result.session) {
      // Set authenticated state
      AuthStateManager.setAuthenticatedState(result.session, {
        onboarded: !!result.user?.onboarded_at,
        profile: result.user,
        favorites: []
      })
    } else {
      handleLoginError(result.error!)
    }
  } catch (error: any) {
    console.log('Login UI error:', error)
    handleLoginError(error.message)
    throw error // Re-throw for component loading state
  }
}

/**
 * Handle OAuth authentication with UI feedback
 */
export const handleOAuthUI = async (provider: 'google' | 'facebook'): Promise<void> => {
  try {
    const result = await AuthService.signInWithOAuth(provider)

    if (result.success && result.session) {
      // Set authenticated state
      AuthStateManager.setAuthenticatedState(result.session, {
        onboarded: !!result.user?.onboarded_at,
        profile: result.user,
        favorites: []
      })
    } else if (result.error && result.error !== 'User cancelled') {
      // Only show error if user didn't cancel
      Alert.alert(
        'Sign In Failed', 
        result.error || `Failed to sign in with ${provider}. Please try again.`
      )
    }
  } catch (error: any) {
    console.log(`OAuth ${provider} UI error:`, error)
    Alert.alert(
      'Sign In Failed', 
      error.message || `Failed to sign in with ${provider}. Please try again.`
    )
    throw error
  }
}

/**
 * Handle onboarding completion with UI feedback
 */
export const handleOnboardingUI = async (data: OnboardingFormData & {
  profileImageUri?: string
  coverImageUri?: string
}): Promise<void> => {
  try {
    const result = await AuthService.completeOnboarding(data)

    if (result.success && result.profile) {
      // Update auth store with onboarding completion
      const { session } = useAuthStore.getState()
      AuthStateManager.setOnboardingCompletedState(session, result.profile)

      Alert.alert(
        'Welcome!', 
        'Your profile has been created successfully!',
        [{ text: 'Continue' }] // Stack.Protected will handle navigation
      )
    } else {
      handleOnboardingError(result.error!)
    }
  } catch (error: any) {
    console.error('Onboarding UI error:', error)
    handleOnboardingError(error.message)
    throw error
  }
}

/**
 * Handle sign out with UI feedback
 */
export const handleSignOutUI = async (): Promise<void> => {
  try {
    await AuthService.signOut()
    // Auth state will be cleared by the auth state listener
  } catch (error: any) {
    console.error('Sign out UI error:', error)
    Alert.alert('Sign Out Failed', 'Unable to sign out. Please try again.')
  }
}

/**
 * Handle forgot password (placeholder)
 */
export const handleForgotPasswordUI = (): void => {
  Alert.alert('Forgot Password', 'This feature will be available soon.')
}

// Error Handlers

/**
 * Handle sign up errors with appropriate user feedback
 */
const handleSignUpError = (error: string): void => {
  if (error.includes('User already registered')) {
    Alert.alert('Account Exists', 'An account with this email already exists. Try signing in instead.', [
      { text: 'Sign In', onPress: () => router.push('/(auth)/login') },
      { text: 'Cancel', style: 'cancel' }
    ])
  } else if (error.includes('too many requests')) {
    Alert.alert('Too Many Attempts', 'Please wait a moment before trying again.')
  } else {
    Alert.alert('Authentication Error', error || 'Failed to create account')
  }
}

/**
 * Handle login errors with appropriate user feedback
 */
const handleLoginError = (error: string): void => {
  if (error.includes('Invalid login credentials')) {
    Alert.alert('Invalid Credentials', 'Please check your email and password and try again.')
  } else if (error.includes('Email not confirmed')) {
    Alert.alert('Email Not Confirmed', 'Please check your email and click the confirmation link before signing in.')
  } else if (error.includes('too many requests')) {
    Alert.alert('Too Many Attempts', 'Please wait a moment before trying again.')
  } else {
    Alert.alert('Authentication Error', error || 'Failed to sign in')
  }
}

/**
 * Handle onboarding errors with appropriate user feedback
 */
const handleOnboardingError = (error: string): void => {
  if (error.includes('User already exists')) {
    Alert.alert(
      'Profile Already Created', 
      'It looks like your profile is already set up. You can edit it in your profile settings.',
      [{ text: 'Continue' }] // Stack.Protected will handle navigation
    )
  } else if (error.includes('Username already taken')) {
    Alert.alert('Username Taken', 'This username is already taken. Please choose a different one.')
  } else if (error.includes('Username')) {
    Alert.alert('Username Error', 'There was an issue with your username. Please try a different one.')
  } else if (error.includes('validation')) {
    Alert.alert('Validation Error', 'Please check your information and try again.')
  } else if (error.includes('network') || error.includes('fetch')) {
    Alert.alert('Connection Error', 'Please check your internet connection and try again.')
  } else {
    Alert.alert(
      'Profile Creation Failed', 
      error || 'Unable to create your profile. Please try again.'
    )
  }
}