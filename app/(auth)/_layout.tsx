import { useAuthStore } from '@bid-scents/shared-sdk'
import { Stack, router } from 'expo-router'
import { useEffect } from 'react'

export default function AuthLayout() {
  const { isAuthenticated, isOnboarded } = useAuthStore()

  useEffect(() => {
    // Redirect authenticated users away from auth screens
    if (isAuthenticated && isOnboarded) {
      router.replace('/(tabs)')
    }
  }, [isAuthenticated, isOnboarded])

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="sign-up" />
      <Stack.Screen name="email-confirmation" />
      <Stack.Screen name="onboarding" />
    </Stack>
  )
}