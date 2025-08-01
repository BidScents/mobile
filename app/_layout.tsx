/**
 * Root Layout Component
 * 
 * Handles app initialization, authentication setup, and provider configuration.
 * Manages font loading, API configuration, and Supabase session management.
 */

import { CloseButton } from '@/components/ui/close-button'
import { LoadingOverlay } from '@/components/ui/loading-overlay'
import { supabase } from '@/lib/supabase'
import { initializeAuth, OpenAPI, useAuthStore } from '@bid-scents/shared-sdk'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { TamaguiProvider, Theme } from '@tamagui/core'
import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { Platform, useColorScheme } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { KeyboardProvider } from 'react-native-keyboard-controller'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import config from 'tamagui.config'
import { QueryProvider } from '../providers/query-provider'
import {
  handleExistingSession,
  handleNoSession,
  setupAuthStateListener
} from '../utils/auth-initialization'



const ANDROID_FONTS = {
  'Roboto-Light': require('../assets/fonts/Roboto-Light.ttf'),
  'Roboto-Regular': require('../assets/fonts/Roboto-Regular.ttf'),
  'Roboto-Medium': require('../assets/fonts/Roboto-Medium.ttf'),
  'Roboto-SemiBold': require('../assets/fonts/Roboto-SemiBold.ttf'),
  'Roboto-Bold': require('../assets/fonts/Roboto-Bold.ttf'),
  'Roboto-ExtraBold': require('../assets/fonts/Roboto-ExtraBold.ttf'),
  'Roboto-Black': require('../assets/fonts/Roboto-Black.ttf'),
} as const


export default function RootLayout() {
  const colorScheme = useColorScheme()
  const [isAppReady, setIsAppReady] = useState(false)
  
  const [fontsLoaded] = useFonts(
    Platform.OS === 'android' ? ANDROID_FONTS : {}
  )

  /**
   * Initialize application on mount
   * 
   * Configures SDK, checks existing session, and sets up auth listeners
   */
  useEffect(() => {
    {/* For development purposes only */}
    // AsyncStorage.clear()


    const initializeApp = async () => {
      if (!fontsLoaded) return

      try {
        const { setLoading, setError, setUser, setSession, user, logout } = useAuthStore.getState()
        
        // Configure SDK
        OpenAPI.BASE = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000'

        initializeAuth()
        setLoading(true)

        // Check existing session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.log('Session retrieval error:', sessionError)
          setError(sessionError.message)
          setIsAppReady(true)
          return
        }

        // Handle session state
        if (session) {
          await handleExistingSession(session, user, setSession, setUser, setLoading)
        } else {
          await handleNoSession(logout)
        }

        // Set up auth listener
        setupAuthStateListener(setSession, setUser, setLoading, logout)
        
        setIsAppReady(true)

      } catch (error) {
        console.log('App initialization error:', error)
        useAuthStore.getState().setError(
          error instanceof Error ? error.message : 'Initialization error'
        )
        setIsAppReady(true)
      }
    }

    initializeApp()
  }, [fontsLoaded])

  if (!fontsLoaded || !isAppReady) {
    return null
  }
  
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <QueryProvider>
          <TamaguiProvider config={config}>
            <Theme name={colorScheme === 'dark' ? 'dark' : 'light'}>
              <SafeAreaProvider>
                <BottomSheetModalProvider>
                  <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="index" />
                    <Stack.Screen name="(screens)/add-listing" 
                    options={{ headerShown: true, title: "Add Listing", headerShadowVisible: false,  animation: 'slide_from_bottom', headerLeft: () => <CloseButton /> }} />
                  </Stack>
                  <LoadingOverlay />
                </BottomSheetModalProvider>
              </SafeAreaProvider>
            </Theme>
          </TamaguiProvider>
        </QueryProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  )
}