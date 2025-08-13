/**
 * OAuth authentication handler for Google and Facebook sign-in.
 * Integrates with Supabase Auth and SDK auth store.
 */
import { supabase } from '@/lib/supabase'
import { AuthService, handleAuthStateChange } from '@bid-scents/shared-sdk'
import { makeRedirectUri } from 'expo-auth-session'
import { router } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import { Alert } from 'react-native'

export class OAuthHandler {
  /**
   * Handles successful authentication and navigation
   */
  private static async handleAuthSuccess(session: any): Promise<void> {
    try {
      handleAuthStateChange('SIGNED_IN', session)
      const loginResult = await AuthService.loginV1AuthLoginGet()
      
      if (loginResult.onboarded) {
        router.replace('/(tabs)/home')
      } else {
        router.replace('/(auth)/onboarding')
      }
    } catch (error) {
      console.log('Auth success handling failed:', error)
      Alert.alert('Error', 'Something went wrong. Please try again.')
      throw error
    }
  }

  /**
   * Parses OAuth tokens from redirect URL (handles fragments and query params)
   */
  private static parseTokens(redirectUrl: string) {
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

  /**
   * Initiates OAuth sign-in with specified provider
   * @param provider - OAuth provider ('google' | 'facebook')
   */
  static async signInWithOAuth(provider: 'google' | 'facebook'): Promise<void> {
    try {
      const redirectTo = makeRedirectUri({ preferLocalhost: false })

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      })

      if (error) throw error
      if (!data.url) throw new Error('No OAuth URL received')

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo)
      
      if (result.type === 'success') {
        const { access_token, refresh_token } = this.parseTokens(result.url)

        if (!access_token || !refresh_token) {
          throw new Error('Authentication tokens not received')
        }

        const { data: sessionData, error: sessionError } = 
          await supabase.auth.setSession({ access_token, refresh_token })

        if (sessionError) throw sessionError
        if (!sessionData.session) throw new Error('Session creation failed')

        await this.handleAuthSuccess(sessionData.session)
        
      } else if (result.type === 'cancel') {
        // User cancelled - no error needed
        return
      } else {
        throw new Error('Authentication failed')
      }
    } catch (error: any) {
      console.log(`OAuth ${provider} error:`, error)
      Alert.alert(
        'Sign In Failed', 
        error.message || `Failed to sign in with ${provider}. Please try again.`
      )
      throw error
    }
  }
}