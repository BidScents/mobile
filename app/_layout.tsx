/**
 * Root Layout Component
 *
 * Handles app initialization, authentication setup, and provider configuration.
 * Manages font loading, API configuration, and Supabase session management.
 */

import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { supabase } from "@/lib/supabase";
import { handleNotificationNavigation } from "@/services/notification-navigation";
import { initializeAuth, OpenAPI, useAuthStore } from "@bid-scents/shared-sdk";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { StripeProvider } from "@stripe/stripe-react-native";
import { TamaguiProvider, Theme } from "@tamagui/core";
import { useFonts } from "expo-font";
import * as Linking from "expo-linking";
import * as Notifications from "expo-notifications";
import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import { Platform, useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
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

  // Initialize theme settings on app startup to load saved preferences
  useThemeSettings();

  const [fontsLoaded] = useFonts(
    Platform.OS === "android" ? ANDROID_FONTS : {}
  );

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
      console.log('Deep link received:', url);
      
      // Handle payment return URLs
      if (url.includes('payment/return')) {
        // Payment completed, this is handled by the payment return route
        console.log('Payment return detected');
      } 
      else if (url.includes('seller/onboarding/complete')) {
        // Seller onboarding completed
        console.log('Seller onboarding completed');
      } 
      else if (url.includes('payment-methods/return')) {
        // Payment method setup completed
        console.log('Payment method setup completed');
      }
      // Add more deep link handlers as needed
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
