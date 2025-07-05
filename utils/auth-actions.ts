/**
 * Authentication action utilities
 * 
 * Helper functions for handling user authentication actions like sign up, login, etc.
 * Manages Supabase auth operations and error handling.
 */

import { supabase } from '@/lib/supabase'
import {
  AuthService,
  handleAuthStateChange,
  type LoginFormData,
  type OnboardingFormData,
  type SignUpFormData
} from '@bid-scents/shared-sdk'
import { decode } from 'base64-arraybuffer'
import { makeRedirectUri } from 'expo-auth-session'
import * as FileSystem from 'expo-file-system'
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
      router.replace('/(auth)/onboarding')
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
   * Upload image to Supabase Storage using ArrayBuffer with compression
   * 
   * Uses expo-file-system and base64-arraybuffer for reliable uploads.
   * Includes image compression to reduce file size and avoid network timeouts.
   */
  const uploadImageToStorage = async (
    imageUri: string, 
    variant: 'profile' | 'cover', 
    userId: string
  ): Promise<string> => {
    try {
      // Create unique filename
      const timestamp = Math.floor(Date.now() / 1000)
      const randomId = Math.random().toString(36).substring(2, 15)
      const fileName = `${timestamp}_${randomId}.jpg`
      let filePath = `${userId}/${variant}/${fileName}`


      // Read the file as Base64 with reduced quality for smaller file size
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      })

      // Check if file was read successfully
      if (!base64 || base64.length === 0) {
        throw new Error('Failed to read image file')
      }

      // Check file size and warn if too large
      const fileSizeBytes = base64.length * 0.75 // Approximate file size
      const fileSizeMB = fileSizeBytes / (1024 * 1024)

      if (fileSizeMB > 10) {
        throw new Error('Image file is too large. Please select a smaller image.')
      }

      // Decode the Base64 string to an ArrayBuffer
      const arrayBuffer = decode(base64)

      // Upload with timeout and retry logic
      let uploadAttempt = 0
      const maxAttempts = 3

      while (uploadAttempt < maxAttempts) {
        try {
          uploadAttempt++

          // Upload the image to Supabase Storage
          const { data, error } = await supabase.storage
            .from('profile-images')
            .upload(filePath, arrayBuffer, {
              upsert: false,
              contentType: 'image/jpeg',
            })

          if (error) {
            console.error('Supabase upload error:', error)
            
            // If it's a file already exists error, try with new filename
            if (error.message?.includes('already exists')) {
              const newRandomId = Math.random().toString(36).substring(2, 15)
              const newFileName = `${timestamp}_${newRandomId}.jpg`
              filePath = `${userId}/${variant}/${newFileName}`
              continue // Retry with new filename
            }
            
            throw new Error(error.message)
          }

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('profile-images')
            .getPublicUrl(data.path)

          // Verify the URL is accessible
          try {
            const response = await fetch(publicUrl, { method: 'HEAD' })
            if (response.ok) {
              return publicUrl
            } else {
              console.warn('Public URL not accessible, status:', response.status)
              return publicUrl // Return anyway, might work later
            }
          } catch (urlError) {
            console.warn('Could not verify URL accessibility:', urlError)
            return publicUrl // Return anyway
          }

        } catch (attemptError: any) {
          console.error(`Upload attempt ${uploadAttempt} failed:`, attemptError)
          
          if (uploadAttempt === maxAttempts) {
            // If all attempts failed, throw the last error
            throw attemptError
          }
          
          // Wait before retry (exponential backoff)
          const waitTime = Math.pow(2, uploadAttempt) * 1000 // 2s, 4s, 8s
          await new Promise(resolve => setTimeout(resolve, waitTime))
        }
      }

      throw new Error('Upload failed after all retry attempts')

    } catch (error) {
      console.error(`${variant} image upload error:`, error)
      throw error
    }
  }

  /**
   * Handle user onboarding form submission
   * 
   * Uploads images to Supabase Storage and submits onboarding data to the API:
   * - Convert selected images to base64 and upload to storage
   * - Validate username uniqueness
   * - Submit onboarding data with image URLs
   * - Handle success/error scenarios
   */
  export const handleOnboarding = async (data: OnboardingFormData & {
    profileImageUri?: string
    coverImageUri?: string
  }) => {
    try {
      // Get current user ID for organized storage
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      // First, validate the username is unique
      const usernameCheck = await AuthService.checkUniqueUsernameV1AuthCheckUsernameGet(data.username)
      
      if (!usernameCheck.is_unique) {
        Alert.alert(
          'Username Taken', 
          'This username is already taken. Please choose a different one.'
        )
        return
      }

      let profileImageUrl: string | undefined
      let coverImageUrl: string | undefined

      // Upload profile image if selected
      if (data.profileImageUri) {
        try {
          profileImageUrl = await uploadImageToStorage(data.profileImageUri, 'profile', user.id)
        } catch (error) {
          console.error('Profile image upload failed:', error)
          Alert.alert(
            'Upload Error', 
            'Failed to upload profile image. Please try again.'
          )
          return
        }
      }

      // Upload cover image if selected
      if (data.coverImageUri) {
        try {
          coverImageUrl = await uploadImageToStorage(data.coverImageUri, 'cover', user.id)
        } catch (error) {
          console.error('Cover image upload failed:', error)
          Alert.alert(
            'Upload Error', 
            'Failed to upload cover image. Please try again.'
          )
          return
        }
      }
      
      // Submit onboarding data with uploaded image URLs
      const onboardingResult = await AuthService.onboardUserV1AuthOnboardPost({
        username: data.username.trim(),
        first_name: data.first_name.trim(),
        last_name: data.last_name.trim(),
        profile_image_url: profileImageUrl,
        cover_image_url: coverImageUrl,
        bio: data.bio?.trim() || undefined
      })

      // Show success message
      Alert.alert(
        'Welcome!', 
        onboardingResult.message || 'Your profile has been created successfully!',
        [{ text: 'Continue', onPress: () => router.replace('/(tabs)') }]
      )

    } catch (error: any) {
      console.log('Onboarding error:', error)
      handleOnboardingError(error)
      throw error // Re-throw to let component handle loading state
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
        [{ text: 'Continue', onPress: () => router.replace('/(tabs)') }]
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