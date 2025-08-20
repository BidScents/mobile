/**
 * Authentication action utilities
 * 
 * Helper functions for handling user authentication actions like sign up, login, etc.
 * Manages Supabase auth operations and error handling.
 */

import { supabase } from '@/lib/supabase'
import { uploadProfileImage } from '@/utils/upload-profile-image'
import {
  AuthService,
  handleAuthStateChange,
  useAuthStore,
  type LoginFormData,
  type OnboardingFormData,
  type SignUpFormData
} from '@bid-scents/shared-sdk'
import { makeRedirectUri } from 'expo-auth-session'
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
    // Use environment variable for redirect URL, fallback to generated URI
    const redirectTo = process.env.EXPO_PUBLIC_EMAIL_REDIRECT_URL || makeRedirectUri({
      preferLocalhost: false,
      path: 'confirm',
    })

    console.log('Email redirect URL:', redirectTo) // Debug log

    const authResult = await supabase.auth.signUp({
      email: data.email.trim(),
      password: data.password,
      options: {
        emailRedirectTo: redirectTo,
      },
    })

    const { data: authData, error } = authResult
    if (error) throw error

    if (authData.user && !authData.session) {
      // Navigate to email confirmation page with email parameter
      router.replace({
        pathname: '/(auth)/email-confirmation',
        params: { email: data.email.trim() }
      })
      return
    }

    // If user is immediately signed in (email confirmation disabled)
    if (authData.session) {
      // Stack.Protected will handle navigation based on auth state
      handleAuthStateChange('SIGNED_IN', authData.session)
    }
  } catch (error: any) {
    console.log('Auth error:', error)
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
    console.log('Auth error:', error)
    handleLoginError(error)
    throw error // Re-throw to let component handle loading state
  }
}

/**
 * Handle successful authentication
 * 
 * Syncs session with SDK and fetches user data
 * Navigation is handled automatically by Stack.Protected guards
 */
export const handleAuthSuccess = async (session: any) => {
  try {
    const { setAuthState } = useAuthStore.getState()
    
    // Configure API token before making API calls
    handleAuthStateChange('SIGNED_IN', session)
    
    try {
      // Fetch user data and set complete auth state atomically
      const loginResult = await AuthService.loginV1AuthLoginGet()
      setAuthState(session, loginResult)
    } catch (apiError) {
      console.log('API call failed during login:', apiError)
      // Set authenticated but not onboarded state for API failures
      setAuthState(session, { onboarded: false, profile: null, favorites: [] })
    }
  } catch (error) {
    console.log('Auth success handling failed:', error)
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
 * Updated onboarding handler with proper retry logic
 */
export const handleOnboarding = async (data: OnboardingFormData & {
  profileImageUri?: string
  coverImageUri?: string
}) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    console.log('Starting onboarding for user:', user.id)

    // Check username uniqueness
    const usernameCheck = await AuthService.checkUniqueUsernameV1AuthCheckUsernameGet(data.username)
    
    if (!usernameCheck.is_unique) {
      Alert.alert('Username Taken', 'This username is already taken. Please choose a different one.')
      return
    }

    let profileImagePath: string | undefined
    let coverImagePath: string | undefined

    // Upload profile image with retry
    if (data.profileImageUri) {
      try {
        console.log('Uploading profile image...')
        profileImagePath = await uploadProfileImage(data.profileImageUri, 'profile')
        console.log('Profile image uploaded successfully')
      } catch (error: any) {
        if (error.message === 'USER_SKIPPED') {
          console.log('User chose to skip profile image')
          profileImagePath = undefined
        } else {
          throw error // Some other error occurred
        }
      }
    }

    // Upload cover image with retry
    if (data.coverImageUri) {
      try {
        console.log('Uploading cover image...')
        coverImagePath = await uploadProfileImage(data.coverImageUri, 'cover')
        console.log('Cover image uploaded successfully')
      } catch (error: any) {
        if (error.message === 'USER_SKIPPED') {
          console.log('User chose to skip cover image')
          coverImagePath = undefined
        } else {
          throw error // Some other error occurred
        }
      }
    }
    
    console.log('Submitting onboarding data...')
    
    // Submit onboarding data
    const onboardingResult = await AuthService.onboardUserV1AuthOnboardPost({
      username: data.username.trim(),
      first_name: data.first_name.trim(),
      last_name: data.last_name.trim(),
      profile_image_url: profileImagePath,
      cover_image_url: coverImagePath,
      bio: data.bio?.trim() || undefined
    })

    console.log('Onboarding completed successfully')

    // Update auth store with complete onboarding state atomically
    const { setAuthState, session } = useAuthStore.getState()
    const onboardingResponse = {
      onboarded: true, // User just completed onboarding
      profile: onboardingResult.profile,
      favorites: []
    }
    setAuthState(session, onboardingResponse)

    Alert.alert(
      'Welcome!', 
      onboardingResult.message || 'Your profile has been created successfully!',
      [{ text: 'Continue' }] // Stack.Protected will handle navigation after onboarding completion
    )

  } catch (error: any) {
    console.error('Onboarding error:', error)
    handleOnboardingError(error)
    throw error
  }
}
/**
 * Handle onboarding errors with appropriate user feedback
 * 
 * Provides specific error messages based on error type:
 * - User already exists → Show profile edit suggestion
 * - Validation errors → Show field-specific errors
 * - Network errors → Show retry message
 * - Generic errors → Show error message
 */
export const handleOnboardingError = (error: any) => {
  if (error.message?.includes('User already exists')) {
    Alert.alert(
      'Profile Already Created', 
      'It looks like your profile is already set up. You can edit it in your profile settings.',
      [{ text: 'Continue' }] // Stack.Protected will handle navigation
    )
  } else if (error.message?.includes('Username')) {
    Alert.alert('Username Error', 'There was an issue with your username. Please try a different one.')
  } else if (error.message?.includes('validation')) {
    Alert.alert('Validation Error', 'Please check your information and try again.')
  } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
    Alert.alert('Connection Error', 'Please check your internet connection and try again.')
  } else {
    Alert.alert(
      'Profile Creation Failed', 
      error.message || 'Unable to create your profile. Please try again.'
    )
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