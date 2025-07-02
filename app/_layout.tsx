// app/_layout.tsx
import { TamaguiProvider, Theme } from '@tamagui/core'
import { Stack } from 'expo-router'
import React, { useEffect } from 'react'
import { Platform, useColorScheme } from 'react-native'
import { KeyboardProvider } from 'react-native-keyboard-controller'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import config from 'tamagui.config'
import { LoadingOverlay } from '../components/ui/loading-overlay'

// SplashScreen.preventAutoHideAsync()

// Import SDK utilities and providers
import { initializeAuth } from '@bid-scents/shared-sdk'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { useFonts } from 'expo-font'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { QueryProvider } from '../providers/query-provider'

export default function App() {
  const colorScheme = useColorScheme()
  
  // Load custom fonts only on Android - iOS will use system fonts
  const [loaded] = useFonts(
    Platform.OS === 'android' ? {
      'Roboto-Light': require('../assets/fonts/Roboto-Light.ttf'),
      'Roboto-Regular': require('../assets/fonts/Roboto-Regular.ttf'),
      'Roboto-Medium': require('../assets/fonts/Roboto-Medium.ttf'),
      'Roboto-SemiBold': require('../assets/fonts/Roboto-SemiBold.ttf'),
      'Roboto-Bold': require('../assets/fonts/Roboto-Bold.ttf'),
      'Roboto-ExtraBold': require('../assets/fonts/Roboto-ExtraBold.ttf'),
      'Roboto-Black': require('../assets/fonts/Roboto-Black.ttf'),
    } : {}
  )

  // Initialize SDK auth system once fonts are loaded
  useEffect(() => {
    if (loaded) {
      // To hide splash screen after fonts are loaded
      // SplashScreen.hideAsync()

      // This configures the API client with stored tokens and sets up auth state
      initializeAuth()
    }
  }, [loaded])

  // Wait for fonts to load before rendering the app
  if (!loaded) return null
  
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <QueryProvider>
          <TamaguiProvider config={config}>
            <Theme name={colorScheme === 'dark' ? 'dark' : 'light'}>
              <SafeAreaProvider>
                <BottomSheetModalProvider>
                  <Stack />
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