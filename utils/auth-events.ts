/**
 * Auth Event Handlers
 * 
 * Simplified handlers for app lifecycle authentication events.
 * Manages session initialization, auth state listeners, and app startup.
 */

import { supabase } from "@/lib/supabase"
import { AuthService } from './auth-service'
import { AuthStateManager } from './auth-state-manager'
import {
  handleAuthStateChange,
  useAuthStore,
} from "@bid-scents/shared-sdk"

/**
 * Handle existing session on app startup
 */
export const handleExistingSession = async (
  session: any,
  existingUser: any
): Promise<void> => {
  try {
    AuthStateManager.setLoading(true)

    // Always fetch fresh user data for up-to-date favorites, payments, messages, etc.
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
    
    // Always fetch fresh user data for up-to-date favorites, payments, messages, etc.
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
  } catch (error) {
    console.error("Error handling sign in event:", error)
    AuthStateManager.handleAuthError(error)
  }
}

/**
 * Handle sign out event
 */
export const handleSignOut = async (): Promise<void> => {
  try {
    await AuthService.signOut()
  } catch (error) {
    console.error("Error during sign out:", error)
    // Clear state even if signout fails
    AuthStateManager.clearAuthState()
  }
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
    }
  })

  // Return cleanup function
  return () => subscription.unsubscribe()
}