import { useAuthStore } from '@bid-scents/shared-sdk';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { registerBackgroundNotificationTask } from '../services/background-notification-task';
import { useAddDeviceToken } from './queries/use-notifications';

/**
 * Get device push token from Expo
 */
async function getExpoPushToken(): Promise<string | null> {
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

  try {
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
    });
    
    return token.data;
  } catch (error) {
    console.error('Error getting push token:', error);
    return null;
  }
}

/**
 * Check if push notifications are permitted
 */
async function checkNotificationPermissions(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
}

/**
 * Request push notification permissions
 */
async function requestNotificationPermissions(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

/**
 * Hook for managing device token registration
 * 
 * Automatically runs when user is authenticated and:
 * - Registers token if permissions granted and no stored token
 * - Re-registers if device token changed (new device)
 * - Handles registration failures with retry capability
 * - Stores successful token in authStore
 */
export function useDeviceToken() {
  const { user, isAuthenticated, deviceToken, setDeviceToken } = useAuthStore();
  const addDeviceToken = useAddDeviceToken();
  const [isChecking, setIsChecking] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<'unknown' | 'granted' | 'denied'>('unknown');

  /**
   * Register device token with backend
   */
  const registerToken = async (token: string): Promise<boolean> => {
    try {
      console.log('Registering device token:', token);
      await addDeviceToken.mutateAsync(token);
      setDeviceToken(token);
      console.log('Device token registered successfully');
      return true;
    } catch (error: any) {
      // Log full error for debugging
      console.error('Device token registration error details:', {
        message: error?.message,
        status: error?.status,
        code: error?.code,
        fullError: error
      });
      
      // Handle duplicate token scenarios gracefully
      // Backend wraps PostgreSQL duplicate key errors as "Internal Server Error"
      const isDuplicateError = 
        error?.message?.includes('duplicate key') ||
        error?.message?.includes('already exists') ||
        error?.message?.includes('Internal Server Error') ||
        error?.status === 409 ||
        error?.status === 500;
      
      if (isDuplicateError) {
        console.log('Device token likely already exists on server (duplicate/500 error), marking as registered');
        setDeviceToken(token);
        return true;
      }
      
      console.error('Failed to register device token:', error);
      return false;
    }
  };

  /**
   * Check and register device token if needed
   */
  const checkAndRegisterToken = async (): Promise<void> => {
    if (!isAuthenticated || !user) return;

    setIsChecking(true);
    
    try {
      // Check current permissions
      const hasPermissions = await checkNotificationPermissions();
      setPermissionStatus(hasPermissions ? 'granted' : 'denied');
      
      if (!hasPermissions) {
        console.log('Push notification permissions not granted');
        setIsChecking(false);
        return;
      }

      // Get current device token
      const currentToken = await getExpoPushToken();
      if (!currentToken) {
        console.log('Could not get device token');
        setIsChecking(false);
        return;
      }

      // Check if we need to register
      const needsRegistration = !deviceToken || deviceToken !== currentToken;
      
      if (needsRegistration) {
        await registerToken(currentToken);
      } else {
        console.log('Device token already registered and current');
      }
    } catch (error) {
      console.error('Error in device token check:', error);
    } finally {
      setIsChecking(false);
    }
  };

  /**
   * Request permissions and register token (for settings screen)
   */
  const requestPermissionsAndRegister = async (): Promise<boolean> => {
    try {
      const granted = await requestNotificationPermissions();
      setPermissionStatus(granted ? 'granted' : 'denied');
      
      if (granted) {
        const token = await getExpoPushToken();
        if (token) {
          return await registerToken(token);
        }
      }
      return false;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  };

  /**
   * Retry registration for current token
   */
  const retryRegistration = async (): Promise<boolean> => {
    if (!isAuthenticated) return false;
    
    const hasPermissions = await checkNotificationPermissions();
    if (!hasPermissions) return false;
    
    const token = await getExpoPushToken();
    if (!token) return false;
    
    return await registerToken(token);
  };

  // Auto-check on authentication changes and register background task
  useEffect(() => {
    if (isAuthenticated && user) {
      checkAndRegisterToken();
      // Register background notification task for badge handling
      registerBackgroundNotificationTask();
    }
  }, [isAuthenticated, user?.id]);

  return {
    isChecking,
    isRegistering: addDeviceToken.isPending,
    permissionStatus,
    hasToken: !!deviceToken,
    registrationError: addDeviceToken.error,
    checkAndRegisterToken,
    requestPermissionsAndRegister,
    retryRegistration,
  };
}