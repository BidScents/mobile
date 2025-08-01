import { useAuthStore } from '@bid-scents/shared-sdk';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Register device for push notifications and get Expo push token
 */
export async function getDeviceToken(): Promise<string | null> {
  if (!Device.isDevice) {
    console.log('Must use physical device for push notifications');
    return null;
  }

  // Set up notification channel for Android
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  // Request permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    console.log('Push notification permissions not granted');
    return null;
  }

  try {
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
    });
    
    console.log('Expo Push Token:', token.data);
    return token.data;
  } catch (error) {
    console.error('Error getting push token:', error);
    return null;
  }
}

/**
 * Send device token to backend
 */
export async function syncDeviceToken(expoPushToken: string): Promise<void> {
  // TODO: Implement when endpoint is available
  console.log('Device token ready to sync:', expoPushToken);
  
  // try {
  //   const response = await DefaultService.registerDeviceTokenV1DeviceTokenPost(expoPushToken);
    
  //   if (response.ok) {
  //     console.log('Device token registered successfully');
  //   } else {
  //     console.error('Failed to register device token:', response.statusText);
  //   }
  // } catch (error) {
  //   console.error('Failed to register device token:', error);
  // }
}

/**
 * Handle navigation when notification is tapped
 * This function is shared between the layout (app launch) and this hook (runtime taps)
 */
export function handleNotificationNavigation(data: any) {
  // import { router } from 'expo-router';
  
  console.log('Notification tapped with data:', data);
  
  // Example navigation based on notification type
  switch (data?.type) {
    case 'new_bid':
      // router.push(`/listing/${data.listing_id}`);
      console.log('Navigate to listing:', data.listing_id);
      break;
    case 'message':
      // router.push(`/chat/${data.conversation_id}`);
      console.log('Navigate to chat:', data.conversation_id);
      break;
    case 'listing_update':
      // router.push(`/listing/${data.listing_id}`);
      console.log('Navigate to listing:', data.listing_id);
      break;
    default:
      // router.push('/notifications');
      console.log('Navigate to notifications page');
      break;
  }
}

/**
 * Hook to handle notifications setup and management
 */
export function useNotifications() {
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    let notificationListener: Notifications.EventSubscription;
    let responseListener: Notifications.EventSubscription;

    const setupNotifications = async () => {
      try {
        // Register for push notifications and get token
        const token = await getDeviceToken();
        
        if (token) {
          // Send token to backend
          await syncDeviceToken(token);
        }

        // Clear badge count when app opens
        await Notifications.setBadgeCountAsync(0);

        // Listen for notifications received while app is foregrounded
        notificationListener = Notifications.addNotificationReceivedListener(notification => {
          console.log('Notification received while app open:', notification);
          
          // Handle in-app notification display here
          // Toast or update UI state
          // The system notification won't show when app is active
        });

        // Listen for user interactions with notifications
        responseListener = Notifications.addNotificationResponseReceivedListener(response => {
          console.log('Notification tapped:', response);
          
          // Handle navigation based on notification data
          const notificationData = response.notification.request.content.data;
          handleNotificationNavigation(notificationData);
        });

      } catch (error) {
        console.error('Error setting up notifications:', error);
      }
    };

    setupNotifications();

    // Cleanup
    return () => {
      notificationListener?.remove();
      responseListener?.remove();
    };
  }, [isAuthenticated, user]);

  return null;
}

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