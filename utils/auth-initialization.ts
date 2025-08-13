/**
 * Authentication initialization utilities
 * 
 * Helper functions for managing app startup authentication logic.
 * Handles session management, user data fetching, and auth state listeners.
 */

import { supabase } from '@/lib/supabase'
import { AuthService, handleAuthStateChange, useAuthStore } from '@bid-scents/shared-sdk'

/**
 * Handle existing session logic
 * 
 * When a valid session exists, this function:
 * - Syncs session with SDK
 * - Checks if user data needs refreshing
 * - Makes API call only if necessary
 */
export const handleExistingSession = async (
  session: any,
  existingUser: any,
  setSession: (session: any) => void,
  setUser: (user: any) => void,
  setLoading: (loading: boolean) => void
) => {
  handleAuthStateChange('SIGNED_IN', session)
  setSession(session)
  
  const needsUserData = !existingUser || !existingUser.onboarded_at
  
  if (needsUserData) {
    try {
      console.log('Fetching user data from API...')
      const loginResult = await AuthService.loginV1AuthLoginGet()
      setUser(loginResult.profile)
    } catch (apiError: any) {
      console.log('API error occurred:', apiError)
      
      if (apiError.status === 500 || apiError.status === 502 || apiError.status === 503) {
        console.log('Server error - maintaining existing auth state')
        if (existingUser) {
          setUser(existingUser)
        } else {
          console.log('No cached user data available, user will need to retry')
        }
      } else if (apiError.status === 401 || apiError.status === 403) {
        console.log('Authentication error - clearing session')
        handleAuthStateChange('SIGNED_OUT', null)
        setUser(null)
        setSession(null)
      } else {
        console.log('User likely needs onboarding')
        setUser(null)
      }
      
      setLoading(false)
    }
  } else {
    console.log('Using cached user data')
    setUser(existingUser)
    setLoading(false)
  }
}

/**
 * Handle no session logic
 * 
 * When no session exists, clear all auth state using the store's logout method
 */
export const handleNoSession = async (logout: () => void) => {
  handleAuthStateChange('SIGNED_OUT', null)
  logout()
}

/**
 * Handle sign in event
 * 
 * Called when user signs in - syncs session and fetches user data if needed
 */
export const handleSignIn = async (
  session: any,
  setSession: (session: any) => void,
  setUser: (user: any) => void,
  setLoading: (loading: boolean) => void
) => {
  handleAuthStateChange('SIGNED_IN', session)
  setSession(session)
  
  const currentUser = useAuthStore.getState().user
  const needsUserData = !currentUser || !currentUser.onboarded_at
  
  if (needsUserData) {
    try {
      const loginResult = await AuthService.loginV1AuthLoginGet()
      setUser(loginResult.profile)
    } catch (apiError: any) {
      console.log('API call failed during auth change:', apiError)
      
      if (apiError.status === 500 || apiError.status === 502 || apiError.status === 503) {
        console.log('Server error during sign in - maintaining existing auth state')
        if (currentUser) {
          setUser(currentUser)
        }
      } else if (apiError.status === 401 || apiError.status === 403) {
        console.log('Authentication error during sign in - clearing session')
        handleAuthStateChange('SIGNED_OUT', null)
        setUser(null)
        setSession(null)
      } else {
        console.log('User likely needs onboarding')
        setUser(null)
      }
      
      setLoading(false)
    }
  }
}

/**
 * Handle sign out event
 * 
 * Called when user signs out - uses store's logout method to clear all state
 */
export const handleSignOut = async (logout: () => void) => {
  handleAuthStateChange('SIGNED_OUT', null)
  logout()
}

/**
 * Set up Supabase auth state change listener
 * 
 * Listens for auth events (sign in/out) and updates app state accordingly
 */
export const setupAuthStateListener = (
  setSession: (session: any) => void,
  setUser: (user: any) => void,
  setLoading: (loading: boolean) => void,
  logout: () => void
) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      console.log('Auth state changed:', event, !!session)
      
      if (event === 'SIGNED_IN' && session) {
        await handleSignIn(session, setSession, setUser, setLoading)
      } else if (event === 'SIGNED_OUT') {
        await handleSignOut(logout)
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed')
        handleAuthStateChange('TOKEN_REFRESHED', session)
      }
    }
  )

  // Return cleanup function
  return () => subscription.unsubscribe()
}