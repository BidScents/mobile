import { NotificationType } from '@bid-scents/shared-sdk';
import { useQueryClient } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { queryKeys } from './queries/query-keys';
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
  const queryClient = useQueryClient();

  useEffect(() => {
    let notificationListener: Notifications.EventSubscription;
    let responseListener: Notifications.EventSubscription;

    const AUCTION_NOTIFICATION_TYPES = new Set<string>([
      NotificationType.AUCTION_EXTENSION,
      NotificationType.LISTING_BID,
      NotificationType.OUTBID,
      NotificationType.AUCTION_EXPIRY,
    ]);

    const parseMaybeJson = (value: unknown): any => {
      if (typeof value !== "string") {
        return value;
      }
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    };

    const extractListingId = (data: any): string | null => {
      if (!data || typeof data !== "object") return null;

      const parsedContent = parseMaybeJson(data.content);
      const parsedData = parseMaybeJson(data.data);

      const candidates = [
        data.listing_id,
        data.listingId,
        data.listing?.id,
        typeof data.listing === "string" ? data.listing : null,
        parsedContent?.listing_id,
        parsedContent?.listingId,
        parsedContent?.listing?.id,
        parsedData?.listing_id,
        parsedData?.listingId,
        parsedData?.listing?.id,
        data.notification?.content?.listing?.id,
      ];

      const listingId = candidates.find((candidate) => typeof candidate === "string" && candidate.length > 0);
      return listingId || null;
    };

    const extractType = (data: any): string | null => {
      if (!data || typeof data !== "object") return null;

      const parsedContent = parseMaybeJson(data.content);
      const parsedData = parseMaybeJson(data.data);

      const candidates = [
        data.type,
        data.notification_type,
        data.event_type,
        parsedContent?.type,
        parsedContent?.notification_type,
        parsedData?.type,
        parsedData?.notification_type,
      ];

      const type = candidates.find((candidate) => typeof candidate === "string" && candidate.length > 0);
      return type ? type.toLowerCase() : null;
    };

    const syncListingIfAuctionEvent = async (notificationData: any) => {
      const listingId = extractListingId(notificationData);
      if (!listingId) return;

      const notificationType = extractType(notificationData);
      if (notificationType && !AUCTION_NOTIFICATION_TYPES.has(notificationType)) return;

      await queryClient.invalidateQueries({
        queryKey: queryKeys.listings.detail(listingId),
        refetchType: "active",
      });
    };

    const setupEventListeners = async () => {
      try {
        // Clear badge count when app opens
        await Notifications.setBadgeCountAsync(0);

        // Listen for notifications received while app is foregrounded
        notificationListener = Notifications.addNotificationReceivedListener(async notification => {
          console.log('Notification received while app open:', notification);
          await syncListingIfAuctionEvent(notification.request.content.data);
          
          // Handle in-app notification display here
          // The system notification won't show when app is active
          // You can show a toast, update UI state, etc.
        });

        // Listen for user interactions with notifications
        responseListener = Notifications.addNotificationResponseReceivedListener(async response => {
          console.log('Notification tapped:', response);

          // Delegate navigation to service
          const notificationData = response.notification.request.content.data;
          await syncListingIfAuctionEvent(notificationData);
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
  }, [queryClient]);

  return {
    // Badge management methods
    clearBadge: () => Notifications.setBadgeCountAsync(0),
    clearNotifications: () => Notifications.dismissAllNotificationsAsync(),
    getBadgeCount: () => Notifications.getBadgeCountAsync(),
    setBadgeCount: (count: number) => Notifications.setBadgeCountAsync(count),
  };
}
