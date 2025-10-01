/**
 * Core Authentication Service
 * 
 * Handles all authentication operations without UI logic.
 * Pure business logic for auth flows - no alerts, no navigation.
 * 
 * IMPORTANT: This service handles auth operations for both React and non-React contexts.
 * 
 * **For non-React contexts (auth event handlers, initialization):**
 * - Use AuthService methods directly
 * 
 * **For React components:**
 * - Use AuthService methods directly
 * - Use auth store (useAuthStore) for accessing auth state
 * - Call AuthService.refreshCurrentUser() after operations that change server state
 */

import { supabase } from '@/lib/supabase'
import { ImageUploadConfigs, uploadSingleImage } from '@/utils/image-upload-service'
import {
  AuthService as ApiAuthService,
  handleAuthStateChange,
  useAuthStore,
  type LoginFormData,
  type LoginResponse,
  type OnboardingFormData,
  type SignUpFormData
} from '@bid-scents/shared-sdk'
import { makeRedirectUri } from 'expo-auth-session'
import * as WebBrowser from 'expo-web-browser'

export interface AuthResult {
  success: boolean
  session?: any
  loginResponse?: LoginResponse
  error?: string
  requiresEmailConfirmation?: boolean
  email?: string
}

export interface OnboardingResult {
  success: boolean
  profile?: any
  error?: string
}

export interface DeleteAccountResult {
  success: boolean
  error?: string
  errorType?: 'active_transactions' | 'unreleased_payments' | 'generic'
}

export interface ForgotPasswordResult {
  success: boolean
  error?: string
}


export class AuthService {
  /**
   * Authenticate with existing session and fetch user data
   * This method directly calls the API and should be used by auth event handlers
   */
  static async authenticateWithSession(session: any): Promise<LoginResponse> {
    // Configure API token before making calls
    handleAuthStateChange('SIGNED_IN', session)
    
    // Fetch complete user data from API
    return await ApiAuthService.loginV1AuthLoginGet()
  }

  /**
   * Sign up with email and password
   */
  static async signUp(data: SignUpFormData): Promise<AuthResult> {
    try {
      const redirectTo = process.env.EXPO_PUBLIC_EMAIL_REDIRECT_URL || makeRedirectUri({
        preferLocalhost: false,
        path: 'confirm',
      })

      const authResult = await supabase.auth.signUp({
        email: data.email.trim(),
        password: data.password,
        options: {
          emailRedirectTo: redirectTo,
        },
      })

      const { data: authData, error } = authResult
      if (error) {
        return { success: false, error: error.message }
      }

      if (authData.user && !authData.session) {
        return { 
          success: true, 
          requiresEmailConfirmation: true,
          email: data.email.trim()
        }
      }

      // Immediate sign in (email confirmation disabled)
      if (authData.session) {
        const loginResult = await this.authenticateWithSession(authData.session)
        return {
          success: true,
          session: authData.session,
          loginResponse: loginResult
        }
      }

      return { success: false, error: 'Unknown sign up result' }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  /**
   * Sign in with email and password
   */
  static async signInWithPassword(data: LoginFormData): Promise<AuthResult> {
    try {
      const authResult = await supabase.auth.signInWithPassword({
        email: data.email.trim(),
        password: data.password,
      })

      const { data: authData, error } = authResult
      if (error) {
        return { success: false, error: error.message }
      }

      if (authData.session) {
        const loginResult = await this.authenticateWithSession(authData.session)
        return {
          success: true,
          session: authData.session,
          loginResponse: loginResult
        }
      }

      return { success: false, error: 'No session created' }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  /**
   * Sign in with OAuth provider
   */
  static async signInWithOAuth(provider: 'google' | 'facebook'): Promise<AuthResult> {
    try {
      const redirectTo = makeRedirectUri({ preferLocalhost: false })

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      })

      if (error) return { success: false, error: error.message }
      if (!data.url) return { success: false, error: 'No OAuth URL received' }

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo)
      
      if (result.type === 'success') {
        const { access_token, refresh_token } = this.parseOAuthTokens(result.url)

        if (!access_token || !refresh_token) {
          return { success: false, error: 'Authentication tokens not received' }
        }

        const { data: sessionData, error: sessionError } = 
          await supabase.auth.setSession({ access_token, refresh_token })

        if (sessionError) return { success: false, error: sessionError.message }
        if (!sessionData.session) return { success: false, error: 'Session creation failed' }

        const loginResult = await this.authenticateWithSession(sessionData.session)
        return {
          success: true,
          session: sessionData.session,
          loginResponse: loginResult
        }
        
      } else if (result.type === 'cancel') {
        return { success: false, error: 'User cancelled' }
      } else {
        return { success: false, error: 'Authentication failed' }
      }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  /**
   * Complete user onboarding
   * This method directly calls the API and handles file uploads
   */
  static async completeOnboarding(data: OnboardingFormData & {
    profileImageUri?: string
    coverImageUri?: string
    uploadedProfileImagePath?: string
    uploadedCoverImagePath?: string
  }, callbacks?: {
    onProfileImageUploaded?: (path: string) => void
    onCoverImageUploaded?: (path: string) => void
  }): Promise<OnboardingResult> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return { success: false, error: 'User not authenticated' }
      }


      let profileImagePath: string | undefined
      let coverImagePath: string | undefined

      // Use pre-uploaded profile image path or upload new one
      if (data.uploadedProfileImagePath) {
        profileImagePath = data.uploadedProfileImagePath
      } else if (data.profileImageUri) {
        try {
          const result = await uploadSingleImage(data.profileImageUri, ImageUploadConfigs.profile('profile'))
          profileImagePath = result.path
          // Notify component of successful upload
          callbacks?.onProfileImageUploaded?.(profileImagePath)
        } catch (error: any) {
          if (error.message !== 'USER_CANCELLED') {
            throw error
          }
        }
      }

      // Use pre-uploaded cover image path or upload new one
      if (data.uploadedCoverImagePath) {
        coverImagePath = data.uploadedCoverImagePath
      } else if (data.coverImageUri) {
        try {
          const result = await uploadSingleImage(data.coverImageUri, ImageUploadConfigs.profile('cover'))
          coverImagePath = result.path
          // Notify component of successful upload
          callbacks?.onCoverImageUploaded?.(coverImagePath)
        } catch (error: any) {
          if (error.message !== 'USER_CANCELLED') {
            throw error
          }
        }
      }
      
      // Submit onboarding data
      const onboardingResult = await ApiAuthService.onboardUserV1AuthOnboardPost({
        username: data.username.trim(),
        first_name: data.first_name.trim(),
        last_name: data.last_name.trim(),
        profile_image_url: profileImagePath,
        cover_image_url: coverImagePath,
        bio: data.bio?.trim() || undefined
      })

      return {
        success: true,
        profile: onboardingResult.profile
      }

    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  /**
   * Delete user account
   * This method directly calls the API and handles Supabase signout
   */
  static async deleteAccount(): Promise<DeleteAccountResult> {
    try {
      // Call API to delete account
      await ApiAuthService.deleteAccountV1AuthDeleteAccountDelete()
      
      AuthService.signOut()
      
      return { success: true }
    } catch (error: any) {
      // Parse specific error messages from backend
      let errorType: 'active_transactions' | 'unreleased_payments' | 'generic' = 'generic'
      let errorMessage = error.message || 'Unable to delete your account. Please try again.'

      // Check if it's an HTTP error with specific message
      if (error.body?.detail || error.response?.data?.detail) {
        const detail = error.body?.detail || error.response?.data?.detail
        
        if (typeof detail === 'string') {
          if (detail.includes('Cannot delete account with active transactions')) {
            errorType = 'active_transactions'
            errorMessage = detail
          } else if (detail.includes('unreleased payments that are unable to be claimed')) {
            errorType = 'unreleased_payments'
            errorMessage = detail
          } else {
            errorMessage = detail
          }
        }
      }

      return { 
        success: false, 
        error: errorMessage,
        errorType 
      }
    }
  }

  /**
   * Sign out user
   */
  static async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw new Error(error.message)
    }
  }

  /**
   * Send password reset email
   */
  static async resetPasswordForEmail(email: string, redirectTo?: string): Promise<ForgotPasswordResult> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }



  /**
   * Refresh current user's authentication state from server
   * Useful after payments, transactions, or other operations that change server-side state
   */
  static async refreshCurrentUser(): Promise<void> {
    const { session } = useAuthStore.getState()
    if (!session) {
      throw new Error('No active session to refresh')
    }

    try {
      useAuthStore.getState().setLoading(true)
      
      // Fetch fresh user data
      const loginResponse = await this.authenticateWithSession(session)
      
      // Update auth store with fresh data
      useAuthStore.getState().setAuthState(session, loginResponse)
    } catch (error: any) {
      useAuthStore.getState().setError(error.message || 'Failed to refresh user data')
      throw error
    } finally {
      useAuthStore.getState().setLoading(false)
    }
  }

  /**
   * Parse OAuth tokens from redirect URL
   */
  private static parseOAuthTokens(redirectUrl: string) {
    const url = new URL(redirectUrl)
    
    // Try query parameters first
    let access_token = url.searchParams.get('access_token')
    let refresh_token = url.searchParams.get('refresh_token')
    
    // If not found, check URL fragment (Facebook uses this)
    if (!access_token && url.hash) {
      const hashParams = new URLSearchParams(url.hash.substring(1))
      access_token = hashParams.get('access_token')
      refresh_token = hashParams.get('refresh_token')
    }
    
    return { access_token, refresh_token }
  }
}