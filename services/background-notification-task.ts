import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';

const BACKGROUND_NOTIFICATION_TASK = 'background-notification';

/**
 * Background task to handle notifications when app is closed/backgrounded
 * 
 * This task runs when push notifications are received while the app
 * is not in the foreground, allowing us to:
 * - Increment app icon badge count
 * - Process notification data
 * - Perform any necessary background work
 */
TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async ({ data, error, executionInfo }) => {
  console.log('Background notification task received:', { data, error, executionInfo });
  
  if (error) {
    console.error('Background notification task error:', error);
    return;
  }

  if (data) {
    try {
      // Increment the app icon badge count
      await incrementAppBadge();
      
      // Log the notification data for debugging
      console.log('Background notification data:', data);
      
      // You can add additional background processing here
      // such as updating cached data, etc.
      
    } catch (taskError) {
      console.error('Error in background notification task:', taskError);
    }
  }
});

/**
 * Increment the app icon badge count
 */
async function incrementAppBadge(): Promise<void> {
  try {
    const currentBadge = await Notifications.getBadgeCountAsync();
    const newBadgeCount = currentBadge + 1;
    await Notifications.setBadgeCountAsync(newBadgeCount);
    console.log(`Background: Badge count incremented to ${newBadgeCount}`);
  } catch (error) {
    console.error('Error incrementing badge in background:', error);
  }
}

/**
 * Register the background notification task
 * Call this during app initialization
 */
export function registerBackgroundNotificationTask(): void {
  try {
    Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);
    console.log('Background notification task registered successfully');
  } catch (error) {
    console.error('Error registering background notification task:', error);
  }
}

/**
 * Unregister the background notification task
 * Call this if you need to clean up
 */
export function unregisterBackgroundNotificationTask(): void {
  try {
    Notifications.unregisterTaskAsync(BACKGROUND_NOTIFICATION_TASK);
    console.log('Background notification task unregistered');
  } catch (error) {
    console.error('Error unregistering background notification task:', error);
  }
}

export { BACKGROUND_NOTIFICATION_TASK };
