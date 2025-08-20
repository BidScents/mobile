/**
 * Core Authentication Service
 * 
 * Handles all authentication operations without UI logic.
 * Pure business logic for auth flows - no alerts, no navigation.
 */

import { supabase } from '@/lib/supabase'
import { uploadProfileImage } from '@/utils/upload-profile-image'
import {
  AuthService as ApiAuthService,
  handleAuthStateChange,
  type LoginFormData,
  type OnboardingFormData,
  type SignUpFormData,
  type LoginResponse
} from '@bid-scents/shared-sdk'
import { makeRedirectUri } from 'expo-auth-session'
import * as WebBrowser from 'expo-web-browser'

export interface AuthResult {
  success: boolean
  session?: any
  user?: any
  error?: string
  requiresEmailConfirmation?: boolean
  email?: string
}

export interface OnboardingResult {
  success: boolean
  profile?: any
  error?: string
}

export class AuthService {
  /**
   * Authenticate with existing session and fetch user data
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
          user: loginResult.profile
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
          user: loginResult.profile
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
          user: loginResult.profile
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
   */
  static async completeOnboarding(data: OnboardingFormData & {
    profileImageUri?: string
    coverImageUri?: string
  }): Promise<OnboardingResult> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return { success: false, error: 'User not authenticated' }
      }

      // Check username uniqueness
      const usernameCheck = await ApiAuthService.checkUniqueUsernameV1AuthCheckUsernameGet(data.username)
      
      if (!usernameCheck.is_unique) {
        return { success: false, error: 'Username already taken' }
      }

      let profileImagePath: string | undefined
      let coverImagePath: string | undefined

      // Upload profile image
      if (data.profileImageUri) {
        try {
          profileImagePath = await uploadProfileImage(data.profileImageUri, 'profile')
        } catch (error: any) {
          if (error.message !== 'USER_SKIPPED') {
            throw error
          }
        }
      }

      // Upload cover image
      if (data.coverImageUri) {
        try {
          coverImagePath = await uploadProfileImage(data.coverImageUri, 'cover')
        } catch (error: any) {
          if (error.message !== 'USER_SKIPPED') {
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
   * Sign out user
   */
  static async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw new Error(error.message)
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