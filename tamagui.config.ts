import { config as baseConfig } from '@tamagui/config/v3'
import { createFont, createTamagui, createTokens } from '@tamagui/core'
import { color } from '@tamagui/themes'
import { Platform } from 'react-native'

// Create platform-specific font configuration
const createPlatformFont = () => {
  const baseFont = {
    size: {
      1: 11,
      2: 12,
      3: 13,
      4: 14,
      5: 16,
      6: 18,
      7: 20,
      8: 23,
      9: 30,
      10: 46,
      11: 55,
      12: 62,
      13: 72,
      14: 92,
      15: 114,
      16: 134,
    },
    lineHeight: {
      1: 15,
      2: 16,
      3: 18,
      4: 20,
      5: 22,
      6: 24,
      7: 26,
      8: 30,
      9: 36,
      10: 52,
      11: 62,
      12: 72,
      13: 84,
      14: 100,
      15: 124,
      16: 144,
    },
    weight: {
      1: '300' as const,
      2: '400' as const,
      3: '500' as const,
      4: '600' as const,
      5: '700' as const,
      6: '800' as const,
      7: '900' as const,
    },
    letterSpacing: {
      1: 0,
      2: -0.15,
      3: -0.2,
      4: 0,
      5: -0.25,
      6: -0.3,
      7: -0.4,
      8: -0.5,
      9: -0.6,
      10: -0.8,
      11: -0.9,
      12: -1.0,
      13: -1.1,
      14: -1.3,
      15: -1.5,
      16: -1.7,
    },
    transform: {
      6: 'uppercase' as const,
      7: 'none' as const,
    },
    color: {
      1: '$colorFocus',
      2: '$color',
    },
  }

  // Platform-specific font configuration
  if (Platform.OS === 'ios') {
    return createFont({
      ...baseFont,
      family: 'System',
      // iOS uses system font, so we don't need to map specific font files
    })
  } else {
    return createFont({
      ...baseFont,
      family: 'Roboto',
      face: {
        // Map font weights to actual font file names for Android
        300: { normal: 'Roboto-Light' },
        400: { normal: 'Roboto-Regular' },
        500: { normal: 'Roboto-Medium' },
        600: { normal: 'Roboto-SemiBold' },
        700: { normal: 'Roboto-Bold' },
        800: { normal: 'Roboto-ExtraBold' },
        900: { normal: 'Roboto-Black' },
      },
    })
  }
}

// Create the platform-aware font
const platformFont = createPlatformFont()

// Rest of your config remains the same...
const tokens = createTokens({
  ...baseConfig.tokens,
  color: {
    ...color,
    primary: '#9334ea',
    primaryHover: '#7c3aed',
    primaryPress: '#6d28d9',
    muted: '#ede8f2',
    mutedForeground: '#666666',
    mutedHover: '#e5ddf0',
    mutedPress: '#ddd2e8',
    success: '#00d900',
    successHover: '#00c300',
    successPress: '#00ad00',
    error: '#ff5a5d',
    errorHover: '#ff4347',
    errorPress: '#ff2d31',
    rating: '#feba17',
    ratingHover: '#fdb000',
    ratingPress: '#fca500',
  },
})

const customThemes = {
  light: {
    ...baseConfig.themes.light,
    background: '#ffffff',
    backgroundHover: '#f8f9fa',
    backgroundPress: '#f1f3f4',
    foreground: '#000000',
    foregroundHover: '#333333',
    foregroundPress: '#666666',
    primary: '#9334ea',
    primaryHover: '#7c3aed',
    primaryPress: '#6d28d9',
    // muted: '#ede8f2',
    // mutedForeground: '#666666',
    // mutedHover: '#e5ddf0',
    // mutedPress: '#ddd2e8',
    muted: '#eeeeee',
    mutedForeground: '#6b7280',
    mutedHover: '#e5e7eb',
    mutedPress: '#d1d5db',
    success: '#00d900',
    successHover: '#00c300',
    successPress: '#00ad00',
    error: '#ff5a5d',
    errorHover: '#ff4347',
    errorPress: '#ff2d31',
    rating: '#feba17',
    ratingHover: '#fdb000',
    ratingPress: '#fca500',
  },
  
  dark: {
    ...baseConfig.themes.dark,
    background: '#000000',
    backgroundHover: '#1a1a1a',
    backgroundPress: '#2d2d2d',
    foreground: '#ffffff',
    foregroundHover: '#e6e6e6',
    foregroundPress: '#cccccc',
    primary: '#9334ea',
    primaryHover: '#7c3aed',
    primaryPress: '#6d28d9',
    muted: '#2d2d2d',
    mutedForeground: '#a2a0a0',
    mutedHover: '#404040',
    mutedPress: '#525252',
    success: '#00d900',
    successHover: '#00c300',
    successPress: '#00ad00',
    error: '#ff5a5d',
    errorHover: '#ff4347',
    errorPress: '#ff2d31',
    rating: '#feba17',
    ratingHover: '#fdb000',
    ratingPress: '#fca500',
  }
}

const config = createTamagui({
  ...baseConfig,
  fonts: {
    ...baseConfig.fonts,
    heading: platformFont,
    body: platformFont,
    mono: platformFont,
    alt: platformFont,
    display: platformFont,
  },
  tokens,
  themes: customThemes,
  defaultTheme: 'light',
})

export type AppConfig = typeof config

declare module '@tamagui/core' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config