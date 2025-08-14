import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { handleNotificationNavigation } from '../services/notification-navigation';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Hook for handling runtime notification events
 * 
 * Manages:
 * - Foreground notification display
 * - Notification tap responses
 * - Badge count management
 * - Navigation delegation
 */
export function useNotificationEvents() {
  useEffect(() => {
    let notificationListener: Notifications.EventSubscription;
    let responseListener: Notifications.EventSubscription;

    const setupEventListeners = async () => {
      try {
        // Clear badge count when app opens
        await Notifications.setBadgeCountAsync(0);

        // Listen for notifications received while app is foregrounded
        notificationListener = Notifications.addNotificationReceivedListener(async notification => {
          console.log('Notification received while app open:', notification);
          
          // Increment badge count even for foreground notifications
          // This ensures badge shows up when user backgrounds the app
          try {
            const currentBadge = await Notifications.getBadgeCountAsync();
            await Notifications.setBadgeCountAsync(currentBadge + 1);
            console.log('Badge count incremented to:', currentBadge + 1);
          } catch (error) {
            console.error('Error incrementing badge count:', error);
          }
          
          // Handle in-app notification display here
          // The system notification won't show when app is active
          // You can show a toast, update UI state, etc.
        });

        // Listen for user interactions with notifications
        responseListener = Notifications.addNotificationResponseReceivedListener(response => {
          console.log('Notification tapped:', response);
          
          // Delegate navigation to service
          const notificationData = response.notification.request.content.data;
          handleNotificationNavigation(notificationData);
        });

      } catch (error) {
        console.error('Error setting up notification event listeners:', error);
      }
    };

    setupEventListeners();

    // Cleanup listeners
    return () => {
      notificationListener?.remove();
      responseListener?.remove();
    };
  }, []);

  return {
    // Badge management methods
    clearBadge: () => Notifications.setBadgeCountAsync(0),
    clearNotifications: () => Notifications.dismissAllNotificationsAsync(),
    getBadgeCount: () => Notifications.getBadgeCountAsync(),
    setBadgeCount: (count: number) => Notifications.setBadgeCountAsync(count),
  };
}