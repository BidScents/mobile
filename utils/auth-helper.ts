import { useAuthStore } from '@bid-scents/shared-sdk';
import { router } from 'expo-router';
import { getGlobalAuthActions } from '@/providers/auth-provider';

/**
 * Authentication helper utilities for handling protected actions
 * 
 * Provides functions to check authentication status and prompt for login
 * when unauthenticated users try to access protected features
 */

/**
 * Check if user is authenticated and show login sheet if not
 * @returns boolean indicating if user is authenticated
 */
export function requireAuth(): boolean {
  const { isAuthenticated } = useAuthStore.getState();
  
  if (isAuthenticated) {
    return true;
  }

  // Try to use the login sheet if available
  const authActions = getGlobalAuthActions();
  if (authActions) {
    authActions.showLoginSheet();
    return false;
  }

  // Fallback to navigation if sheet is not available
  router.push('/(auth)' as any);
  return false;
}

/**
 * Higher-order function to wrap actions that require authentication
 * @param action The action to perform if authenticated
 * @param options Authentication check options
 * @returns A function that performs the auth check before executing the action
 */
export function withAuth<T extends (...args: any[]) => any>(
  action: T
): T {
  return ((...args: Parameters<T>) => {
    if (requireAuth()) {
      return action(...args);
    }
  }) as T;
}

/**
 * Hook to get authentication status and helper functions
 * @returns Object with authentication status and helper functions
 */
export function useAuthHelper() {
  const { isAuthenticated, isOnboarded } = useAuthStore();

  return {
    isAuthenticated,
    isOnboarded,
    requireAuth,
    withAuth,
    isFullyAuthenticated: isAuthenticated && isOnboarded,
  };
}

