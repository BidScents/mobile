import React from 'react';
import { useFonts } from 'expo-font';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TamaguiProvider, Theme } from '@tamagui/core';
import { Stack } from 'expo-router';
import config from 'tamagui.config';


// SplashScreen.preventAutoHideAsync()


export default function App() {
  const colorScheme = useColorScheme();
  
  const [loaded] = useFonts({
    'Roboto-Light': require('../assets/fonts/Roboto-Light.ttf'),
    'Roboto-Regular': require('../assets/fonts/Roboto-Regular.ttf'),
    'Roboto-Medium': require('../assets/fonts/Roboto-Medium.ttf'),
    'Roboto-SemiBold': require('../assets/fonts/Roboto-SemiBold.ttf'),
    'Roboto-Bold': require('../assets/fonts/Roboto-Bold.ttf'),
    'Roboto-ExtraBold': require('../assets/fonts/Roboto-ExtraBold.ttf'),
    'Roboto-Black': require('../assets/fonts/Roboto-Black.ttf'),
  });

  // Use when you want to hide the splash screen after fonts are loaded
  // useEffect(() => { 
  //   if (loaded) {
  //     SplashScreen.hideAsync()
  //   }
  // }, [loaded])

  if (!loaded) return null


  return (
    <TamaguiProvider config={config}>
      <Theme name={colorScheme === 'dark' ? 'dark' : 'light'}>
        <SafeAreaProvider>
          <Stack />
        </SafeAreaProvider>
      </Theme>
    </TamaguiProvider>
  );
}
