/**
 * Auth UI Handlers
 * 
 * UI-specific authentication handlers with error handling and user feedback.
 * Includes alerts, navigation, and user-friendly error messages.
 */

import { AuthService } from './auth-service'
import { AuthStateManager } from './auth-state-manager'
import {
  type LoginFormData,
  type OnboardingFormData,
  type SignUpFormData
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
      } else if (result.session && result.loginResponse) {
        // Immediate sign in - set auth state with complete server data
        AuthStateManager.setAuthenticatedState(result.session, result.loginResponse)
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

    if (result.success && result.session && result.loginResponse) {
      // Set authenticated state with complete server data
      AuthStateManager.setAuthenticatedState(result.session, result.loginResponse)
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

    if (result.success && result.session && result.loginResponse) {
      // Set authenticated state with complete server data
      AuthStateManager.setAuthenticatedState(result.session, result.loginResponse)
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
      // Refresh complete auth state from server to get all up-to-date data
      await AuthService.refreshCurrentUser()

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
 * Handle account deletion with confirmation
 */
export const handleDeleteAccountUI = async (): Promise<void> => {
  return new Promise((resolve) => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your data.',
      [
        { text: 'Cancel', style: 'cancel', onPress: () => resolve() },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            try {
              const result = await AuthService.deleteAccount()
              if (result.success) {
                // Auth state will be cleared by the auth state listener
                Alert.alert(
                  'Account Deleted', 
                  'Your account has been successfully deleted.',
                  [{ text: 'OK' }]
                )
              } else {
                handleDeleteAccountError(result.error!, result.errorType)
              }
            } catch (error: any) {
              console.error('Delete account UI error:', error)
              Alert.alert(
                'Deletion Failed', 
                'Unable to delete your account. Please try again.'
              )
            }
            resolve()
          }
        }
      ]
    )
  })
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

/**
 * Handle delete account errors with appropriate user feedback
 */
const handleDeleteAccountError = (error: string, errorType?: 'active_transactions' | 'unreleased_payments' | 'generic'): void => {
  switch (errorType) {
    case 'active_transactions':
      Alert.alert(
        'Cannot Delete Account',
        'You cannot delete your account while you have active transactions. Please wait for your current transactions to complete before trying again.',
        [{ text: 'OK' }]
      )
      break
    
    case 'unreleased_payments':
      Alert.alert(
        'Payment Setup Required',
        'You have pending payments that need to be released. Please complete your payment setup first before deleting your account.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Setup Payments', 
            onPress: () => router.push('/(tabs)/profile/settings/payments' as any)
          }
        ]
      )
      break
    
    default:
      Alert.alert(
        'Deletion Failed',
        error || 'Unable to delete your account. Please try again.'
      )
      break
  }
}