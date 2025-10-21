import { useAuthStore } from '@bid-scents/shared-sdk';
import * as Notifications from 'expo-notifications';
import { useDeviceToken } from './use-device-token';
import { useNotificationEvents } from './use-notification-events';

/**
 * Main notification orchestrator hook
 * 
 * Combines device token management and notification event handling
 * into a single, clean interface. This hook should be used in the
 * main app layout to set up the complete notification system.
 */
export function useNotifications() {
  const { isAuthenticated } = useAuthStore();
  
  // Handle device token registration (runs on auth changes)
  const tokenManager = useDeviceToken();
  
  // Handle notification events (always active)
  const eventManager = useNotificationEvents();
  eventManager.clearNotifications();

  return {
    // Device token management
    isTokenRegistering: tokenManager.isRegistering,
    isCheckingToken: tokenManager.isChecking,
    tokenError: tokenManager.registrationError,
    permissionStatus: tokenManager.permissionStatus,
    hasToken: tokenManager.hasToken,
    
    // Manual actions (for settings screen)
    requestPermissionsAndRegister: tokenManager.requestPermissionsAndRegister,
    retryTokenRegistration: tokenManager.retryRegistration,
    
    // Event management utilities
    clearBadge: eventManager.clearBadge,
    clearNotifications: eventManager.clearNotifications,
    
    // Overall status
    isAuthenticated,
  };
}

/**
 * Utility functions exported for convenience
 */

/**
 * Clear all notifications and badge count
 */
export async function clearNotifications() {
  await Notifications.setBadgeCountAsync(0);
  await Notifications.dismissAllNotificationsAsync();
}

/**
 * Check if notifications are enabled
 */
export async function areNotificationsEnabled(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
}

// Re-export individual hooks for advanced usage
export { useDeviceToken } from './use-device-token';
export { useNotificationEvents } from './use-notification-events';

