/**
 * Auth Event Handlers
 * 
 * Simplified handlers for app lifecycle authentication events.
 * Manages session initialization, auth state listeners, and app startup.
 */

import { supabase } from "@/lib/supabase"
import {
  handleAuthStateChange,
  useAuthStore,
} from "@bid-scents/shared-sdk"
import { router } from "expo-router"
import { AuthService } from './auth-service'
import { AuthStateManager } from './auth-state-manager'

/**
 * Handle existing session on app startup
 */
export const handleExistingSession = async (
  session: any,
  existingUser: any
): Promise<void> => {
  try {
    AuthStateManager.setLoading(true)

    if (AuthStateManager.needsUserData(existingUser)) {
      // Need to fetch fresh user data
      try {
        const loginResult = await AuthService.authenticateWithSession(session)
        AuthStateManager.setAuthenticatedState(session, loginResult)
      } catch (apiError: any) {
        console.log("API error occurred:", apiError)

        if (
          apiError.status === 500 ||
          apiError.status === 502 ||
          apiError.status === 503
        ) {
          // Server error - use cached data if available
          console.log("Server error - maintaining existing auth state")
          if (existingUser) {
            AuthStateManager.setAuthenticatedStateWithFallback(session, existingUser)
          } else {
            console.log("No cached user data available, user will need to retry")
            AuthStateManager.setLoading(false)
          }
        } else if (apiError.status === 401 || apiError.status === 403) {
          // Auth error - clear session
          console.log("Authentication error - clearing session")
          AuthStateManager.clearAuthState()
        } else {
          // Other error - assume needs onboarding
          console.log("User likely needs onboarding")
          AuthStateManager.setAuthenticatedStateWithFallback(session)
        }
      }
    } else {
      // Use cached user data for fast startup
      console.log("Using cached user data for fast startup")
      AuthStateManager.setAuthenticatedStateWithFallback(session, existingUser)
      
      // Fetch fresh data in background to keep store updated
      refreshUserDataInBackground(session)
    }
  } catch (error) {
    console.error("Error handling existing session:", error)
    AuthStateManager.handleAuthError(error)
  }
}

/**
 * Handle no session on app startup
 */
export const handleNoSession = async (): Promise<void> => {
  handleAuthStateChange("SIGNED_OUT", null)
  AuthStateManager.setLoading(false)
}

/**
 * Handle sign in event from auth state listener
 */
export const handleSignInEvent = async (session: any): Promise<void> => {
  try {
    AuthStateManager.setLoading(true)
    
    const { user: currentUser } = useAuthStore.getState()
    
    if (AuthStateManager.needsUserData(currentUser)) {
      // Need to fetch fresh user data
      try {
        const loginResult = await AuthService.authenticateWithSession(session)
        AuthStateManager.setAuthenticatedState(session, loginResult)
      } catch (apiError: any) {
        console.log("API call failed during auth change:", apiError)

        if (
          apiError.status === 500 ||
          apiError.status === 502 ||
          apiError.status === 503
        ) {
          // Server error - use existing data if available
          console.log("Server error during sign in - maintaining existing auth state")
          if (currentUser) {
            AuthStateManager.setAuthenticatedStateWithFallback(session, currentUser)
          } else {
            AuthStateManager.setLoading(false)
          }
        } else if (apiError.status === 401 || apiError.status === 403) {
          // Auth error - clear session
          console.log("Authentication error during sign in - clearing session")
          AuthStateManager.clearAuthState()
        } else {
          // Other error - assume needs onboarding
          console.log("User likely needs onboarding")
          AuthStateManager.setAuthenticatedStateWithFallback(session)
        }
      }
    } else {
      // Use existing user data
      AuthStateManager.setAuthenticatedStateWithFallback(session, currentUser)
    }
  } catch (error) {
    console.error("Error handling sign in event:", error)
    AuthStateManager.handleAuthError(error)
  }
}

/**
 * Background refresh function to update user data without blocking UI
 */
const refreshUserDataInBackground = async (session: any): Promise<void> => {
  try {
    console.log("Refreshing user data in background")
    const loginResult = await AuthService.authenticateWithSession(session)
    
    AuthStateManager.setAuthenticatedState(session, loginResult)

    
    console.log("Background refresh completed")
  } catch (error) {
    console.log("Background refresh failed, keeping cached data:", error)
    // Silently fail - user keeps cached data
  }
}

const handlePasswordRecoveryEvent =  () => {
  router.replace("/(screens)/reset-password")
}

/**
 * Set up Supabase auth state change listener
 */
export const setupAuthStateListener = (): (() => void) => {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(async (event, session) => {
    console.log("Auth state changed:", event, !!session)

    if (event === "SIGNED_IN" && session) {
      await handleSignInEvent(session)
    } else if (event === "SIGNED_OUT") {
      console.log("Supabase triggered SIGNED_OUT")
      handleAuthStateChange("SIGNED_OUT", null)
    } else if (event === "TOKEN_REFRESHED") {
      console.log("Token refreshed")
      handleAuthStateChange("TOKEN_REFRESHED", session)
    } else if (event === "PASSWORD_RECOVERY") {
      console.log("Password recovery")
      handlePasswordRecoveryEvent()
    }
  })

  // Return cleanup function
  return () => subscription.unsubscribe()
}