/**
 * Root Layout Component
 *
 * Handles app initialization, authentication setup, and provider configuration.
 * Manages font loading, API configuration, and Supabase session management.
 */

import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { supabase } from "@/lib/supabase";
import { handleNotificationNavigation } from "@/services/notification-navigation";
import { initializeAuth, OpenAPI, useAuthStore, useLoadingStore } from "@bid-scents/shared-sdk";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { StripeProvider } from "@stripe/stripe-react-native";
import { TamaguiProvider, Theme } from "@tamagui/core";
import { useFonts } from "expo-font";
import * as Linking from "expo-linking";
import * as Notifications from "expo-notifications";
import { router, Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Platform, useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import { SafeAreaProvider } from "react-native-safe-area-context";
import config from "tamagui.config";
import { useThemeSettings } from "../hooks/use-theme-settings";
import { MessagingProvider } from "../providers/messaging-provider";
import { QueryProvider } from "../providers/query-provider";
import {
  handleExistingSession,
  handleNoSession,
  setupAuthStateListener,
} from "../utils/auth-events";

const ANDROID_FONTS = {
  "Roboto-Light": require("../assets/fonts/Roboto-Light.ttf"),
  "Roboto-Regular": require("../assets/fonts/Roboto-Regular.ttf"),
  "Roboto-Medium": require("../assets/fonts/Roboto-Medium.ttf"),
  "Roboto-SemiBold": require("../assets/fonts/Roboto-SemiBold.ttf"),
  "Roboto-Bold": require("../assets/fonts/Roboto-Bold.ttf"),
  "Roboto-ExtraBold": require("../assets/fonts/Roboto-ExtraBold.ttf"),
  "Roboto-Black": require("../assets/fonts/Roboto-Black.ttf"),
} as const;

export default function RootLayout() {
  const [isAppReady, setIsAppReady] = useState(false);
  const colorScheme = useColorScheme();
  const { isAuthenticated, isOnboarded } = useAuthStore();
  const { showLoading, hideLoading } = useLoadingStore();

  // Initialize theme settings on app startup to load saved preferences
  useThemeSettings();

  const [fontsLoaded] = useFonts(
    Platform.OS === "android" ? ANDROID_FONTS : {}
  );

  useEffect(() => {
    Purchases.setLogLevel(LOG_LEVEL.VERBOSE);

    if (Platform.OS === 'ios') {
       Purchases.configure({apiKey: 'appl_zojxPqwCFZkxAZcgptlWJuxPYUq'});
    } else if (Platform.OS === 'android') {
       Purchases.configure({apiKey: 'goog_mOyAxkpXxPoViKbjsdZXLlOEktR'});
    }

    // Note: RevenueCat user login will happen after Supabase authentication
    // This ensures RevenueCat is synced with the correct user ID
  }, []);

  /**
   * Initialize application on mount
   *
   * Configures SDK, checks existing session, and sets up auth listeners
   */
  useEffect(() => {
    {
      /* For development purposes only */
    }
    // AsyncStorage.clear()

    const initializeApp = async () => {
      if (!fontsLoaded) return;

      try {
        const { setLoading, setError, user } =
          useAuthStore.getState();

        // Configure SDK
        OpenAPI.BASE =
          process.env.EXPO_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

        initializeAuth();
        setLoading(true);

        // Check existing session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.log("Session retrieval error:", sessionError);
          setError(sessionError.message);
          setIsAppReady(true);
          return;
        }

        // Handle session state
        if (session) {
          await handleExistingSession(session, user);
        } else {
          await handleNoSession();
        }

        // Set up auth listener
        setupAuthStateListener();

        setIsAppReady(true);
      } catch (error) {
        console.log("App initialization error:", error);
        useAuthStore
          .getState()
          .setError(
            error instanceof Error ? error.message : "Initialization error"
          );
        setIsAppReady(true);
      }
    };

    initializeApp();
  }, [fontsLoaded]);

  /**
   * Handle app launch from notification and deep links
   *
   * Check if the app was opened from a notification and handle navigation
   */
  useEffect(() => {
    if (!isAppReady) return;

    const checkNotificationLaunch = async () => {
      try {
        // Check if app was opened from a notification
        const response = await Notifications.getLastNotificationResponseAsync();

        if (response) {
          console.log("App was opened from notification:", response);

          // Handle navigation based on notification data
          const notificationData = response.notification.request.content.data;
          if (notificationData) {
            handleNotificationNavigation(notificationData);
          }
        }
      } catch (error) {
        console.log("Error checking notification launch:", error);
      }
    };

    // Small delay to ensure navigation is ready
    const timer = setTimeout(checkNotificationLaunch, 1000);

    return () => clearTimeout(timer);
  }, [isAppReady]);

  /**
   * Handle deep link navigation for payment returns
   */
  useEffect(() => {
    if (!isAppReady) return;

    const handleDeepLink = (url: string) => {
      // Parse URL to extract components
      try {
        const parsedUrl = new URL(url);
        
        // Check for password reset token
        if (url.includes('forgot-password')) {
          // Show loading overlay immediately for smooth UX
          showLoading();
          
          // Check query parameters first
          const urlParams = new URLSearchParams(parsedUrl.search);
          let token = urlParams.get('token');
          let access_token = urlParams.get('access_token');
          let refresh_token = urlParams.get('refresh_token');
          
          // If not found in query parameters, check URL fragment (where Supabase puts them)
          if (!token && !access_token && parsedUrl.hash) {
            const hashParams = new URLSearchParams(parsedUrl.hash.substring(1)); // Remove # prefix
            token = hashParams.get('token');
            access_token = hashParams.get('access_token');
            refresh_token = hashParams.get('refresh_token');
          }
          
          // Authenticate user with tokens and navigate to reset screen
          if (access_token && refresh_token) {
            // Set session with the reset tokens to authenticate the user
            supabase.auth.setSession({ access_token, refresh_token }).then(async ({ data, error }) => {
              if (error) {
                hideLoading(); // Hide loading on error
                Alert.alert(
                  'Authentication Failed',
                  'Unable to authenticate with the reset link. Please request a new password reset.',
                  [{ text: 'OK' }]
                );
              } else if (data.session) {
                // The auth state listener will handle updating the auth store
                // Small delay to ensure auth state is updated, then navigate
                // Loading will be hidden by the reset password screen
                setTimeout(() => {
                  router.replace('/(screens)/reset-password');
                }, 500);
              }
            });
          } else if (token) {
            hideLoading(); // Hide loading on error
            Alert.alert(
              'Invalid Reset Link',
              'This password reset link is not supported. Please request a new password reset.',
              [{ text: 'OK' }]
            );
          } else {
            hideLoading(); // Hide loading if no tokens found
          }
        }
      } catch (error) {
        // Silently handle URL parsing errors
      }
    };

    // Handle initial URL (if app was closed)
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink(url);
    });

    // Handle URLs when app is running
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    return () => subscription?.remove();
  }, [isAppReady]);

  if (!fontsLoaded || !isAppReady) {
    return null;
  }

  const routes = () => {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        {/* Unauthenticated routes */}
        <Stack.Protected guard={!isAuthenticated}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>

        {/* Authenticated and onboarded (main app) */}
        <Stack.Protected guard={isAuthenticated && isOnboarded}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(screens)" />
          <Stack.Screen name="listing" />
        </Stack.Protected>

        {/* Authenticated but not onboarded */}
        <Stack.Protected guard={isAuthenticated && !isOnboarded}>
          <Stack.Screen name="(onboarding)" />
        </Stack.Protected>
      </Stack>
    );
  };

  return (
    <StripeProvider
      publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!}
      // merchantIdentifier="merchant.com.bidscents.app"
      urlScheme="com.bidscents.mobile"
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <KeyboardProvider>
          <QueryProvider>
            <MessagingProvider>
              <TamaguiProvider config={config}>
                <Theme name={colorScheme === "dark" ? "dark" : "light"}>
                  <SafeAreaProvider>
                    <BottomSheetModalProvider>
                      {routes()}
                      <LoadingOverlay />
                    </BottomSheetModalProvider>
                  </SafeAreaProvider>
                </Theme>
              </TamaguiProvider>
            </MessagingProvider>
          </QueryProvider>
        </KeyboardProvider>
      </GestureHandlerRootView>
    </StripeProvider>
  );
}
