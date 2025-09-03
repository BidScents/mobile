/**
 * Auth State Manager
 * 
 * Centralized handler for authentication state updates in edge cases.
 * Most auth operations should use AuthService.refreshCurrentUser() instead.
 * This class handles fallback scenarios and special cases.
 */

import {
  handleAuthStateChange,
  useAuthStore,
  type LoginResponse
} from '@bid-scents/shared-sdk'

export class AuthStateManager {
  /**
   * Set complete authenticated state atomically with server data
   * Use this when you have a complete LoginResponse from the server
   */
  static setAuthenticatedState(session: any, loginResponse: LoginResponse): void {
    const { setAuthState } = useAuthStore.getState()
    
    // Configure API token
    handleAuthStateChange('SIGNED_IN', session)
    
    // Set complete auth state atomically with server data
    setAuthState(session, loginResponse)
  }

  /**
   * Set authenticated state with fallback data (for API failures)
   * Only use when server is unreachable - preserves existing user data
   */
  static setAuthenticatedStateWithFallback(session: any, fallbackUser?: any): void {
    const currentState = useAuthStore.getState()
    const { setAuthState } = useAuthStore.getState()
    
    // Configure API token
    handleAuthStateChange('SIGNED_IN', session)
    
    // Preserve existing data, only update what we have new info for
    const fallbackResponse = {
      onboarded: fallbackUser ? !!fallbackUser.onboarded_at : currentState.isOnboarded,
      profile: fallbackUser || currentState.user,
      // Preserve existing data instead of hardcoding empty values
      favorites: currentState.favorites || [],
      payment_details: currentState.paymentDetails || null,
      unread_messages: currentState.unreadMessages || 0,
      unseen_notifications: currentState.unseenNotifications || 0
    }
    
    // Set auth state preserving existing user data
    setAuthState(session, fallbackResponse)
  }

  /**
   * Clear all authentication state
   */
  static clearAuthState(): void {
    const { logout } = useAuthStore.getState()
    
    // Clear auth state and configure empty token
    handleAuthStateChange('SIGNED_OUT', null)
    logout() // This clears all auth state atomically
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
    const { 
      isAuthenticated, 
      isOnboarded, 
      user, 
      session, 
      loading, 
      favorites, 
      paymentDetails, 
      unreadMessages, 
      unseenNotifications 
    } = useAuthStore.getState()
    return {
      isAuthenticated,
      isOnboarded,
      user,
      session,
      loading,
      favorites,
      paymentDetails,
      unreadMessages,
      unseenNotifications
    }
  }

  /**
   * Check if user needs onboarding data
   */
  static needsUserData(existingUser: any): boolean {
    return !existingUser || !existingUser.onboarded_at
  }
}