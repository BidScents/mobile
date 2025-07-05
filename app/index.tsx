import { useAuthStore } from '@bid-scents/shared-sdk'
import { Redirect } from 'expo-router'
import { View } from 'react-native'
import { Spinner } from 'tamagui'

export default function RootIndex() {
  const { isAuthenticated, isOnboarded, loading } = useAuthStore()

  // Show loading while checking auth state
  if (loading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: 'white' 
      }}>
        <Spinner size="large" color="$foreground" />
      </View>
    )
  }

  // Redirect based on auth state
  if (isAuthenticated && isOnboarded) {
    return <Redirect href="/(tabs)" />
  }

  if (isAuthenticated && !isOnboarded) {
    return <Redirect href="/(auth)/onboarding" />
  }

  return <Redirect href="/(auth)" />
}