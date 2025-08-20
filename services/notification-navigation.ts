import { router } from 'expo-router';

/**
 * Handle navigation based on notification data
 * 
 * @param data - Notification data from the push notification
 */
export function handleNotificationNavigation(data: any): void {
  if (!data) {
    console.log('No navigation data found, going to notifications page');
    router.push('/(tabs)/notifications');
    return;
  }

  console.log('Handling notification navigation:', data);

  try {
    // Navigate to listing if it exists (covers most notification types)
    if (data.listing?.id) {
      router.push(`/listing/${data.listing.id}`);
      return;
    }
    
    // Navigate to follower profile
    if (data.follower?.id) {
      router.push(`/(tabs)/profile/${data.follower.id}`);
      return;
    }
    
    // Navigate to chat conversation
    if (data.conversation_id) {
      console.log('Navigate to chat:', data.conversation_id);
      router.push('/(tabs)/chat');
      return;
    }
    
    // Fallback to notifications page
    router.push('/(tabs)/notifications');
  } catch (error) {
    console.error('Error handling notification navigation:', error);
    router.push('/(tabs)/notifications');
  }
}

