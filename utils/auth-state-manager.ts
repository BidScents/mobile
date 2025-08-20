/**
 * Auth State Manager
 * 
 * Centralized handler for all authentication state updates.
 * Manages atomic updates to prevent race conditions.
 */

import {
  useAuthStore,
  handleAuthStateChange,
  type LoginResponse
} from '@bid-scents/shared-sdk'

export class AuthStateManager {
  /**
   * Set complete authenticated state atomically
   */
  static setAuthenticatedState(session: any, loginResponse: LoginResponse): void {
    const { setAuthState } = useAuthStore.getState()
    
    // Configure API token
    handleAuthStateChange('SIGNED_IN', session)
    
    // Set complete auth state atomically
    setAuthState(session, loginResponse)
  }

  /**
   * Set authenticated state with fallback data (for API failures)
   */
  static setAuthenticatedStateWithFallback(session: any, fallbackUser?: any): void {
    const { setAuthState } = useAuthStore.getState()
    
    // Configure API token
    handleAuthStateChange('SIGNED_IN', session)
    
    // Create fallback response
    const fallbackResponse = {
      onboarded: fallbackUser ? !!fallbackUser.onboarded_at : false,
      profile: fallbackUser || null,
      favorites: []
    }
    
    // Set auth state with fallback data
    setAuthState(session, fallbackResponse)
  }

  /**
   * Set onboarding completed state
   */
  static setOnboardingCompletedState(session: any, profile: any): void {
    const { setAuthState } = useAuthStore.getState()
    
    const onboardingResponse = {
      onboarded: true,
      profile,
      favorites: []
    }
    
    setAuthState(session, onboardingResponse)
  }

  /**
   * Clear all authentication state
   */
  static clearAuthState(): void {
    const { setAuthState } = useAuthStore.getState()
    
    // Clear auth state and configure empty token
    handleAuthStateChange('SIGNED_OUT', null)
    setAuthState(null, null)
  }

  /**
   * Handle authentication errors
   */
  static handleAuthError(error: any): void {
    const { setError, setLoading } = useAuthStore.getState()
    
    setError(error.message || 'Authentication error')
    setLoading(false)
  }

  /**
   * Set loading state
   */
  static setLoading(loading: boolean): void {
    const { setLoading } = useAuthStore.getState()
    setLoading(loading)
  }

  /**
   * Get current auth state
   */
  static getCurrentAuthState() {
    const { isAuthenticated, isOnboarded, user, session, loading } = useAuthStore.getState()
    return {
      isAuthenticated,
      isOnboarded,
      user,
      session,
      loading
    }
  }

  /**
   * Check if user needs onboarding data
   */
  static needsUserData(existingUser: any): boolean {
    return !existingUser || !existingUser.onboarded_at
  }
}