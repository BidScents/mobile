// tamagui.config.ts
import { config as baseConfig } from '@tamagui/config/v3'
import { createFont, createTamagui, createTokens } from '@tamagui/core'
import { color, radius, size, space, zIndex } from '@tamagui/themes'

// Create Roboto font configuration
const robotoFont = createFont({
  family: 'Roboto',
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
    1: '300', // Light
    2: '400', // Regular
    3: '500', // Medium
    4: '600', // Semi Bold
    5: '700', // Bold
    6: '800', // Extra Bold
    7: '900', // Black
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
    6: 'uppercase',
    7: 'none',
  },
  color: {
    1: '$colorFocus',
    2: '$color',
  },
  face: {
    300: { normal: 'Roboto-Light' },
    400: { normal: 'Roboto-Regular' },
    500: { normal: 'Roboto-Medium' },
    600: { normal: 'Roboto-SemiBold' },
    700: { normal: 'Roboto-Bold' },
    800: { normal: 'Roboto-ExtraBold' },
    900: { normal: 'Roboto-Black' },
  },
})

// Create custom tokens using base tokens
const tokens = createTokens({
  color,
  radius,
  size,
  space,
  zIndex,
})

const customThemes = {
  light: {
    // Base colors from Figma
    background: '#ffffff',
    foreground: '#000000',
    muted: '#ede8f2',
    mutedForeground: '#666666',
    primary: '#9334ea',
    
    // Interactive states
    backgroundHover: '#f8f9fa',
    backgroundPress: '#f1f3f4',
    foregroundHover: '#333333',
    foregroundPress: '#666666',
    primaryHover: '#7c3aed',
    primaryPress: '#6d28d9',
    mutedHover: '#e5ddf0',
    mutedPress: '#ddd2e8',
    
    // Semantic colors
    green: '#00d900',
    greenHover: '#00c300',
    greenPress: '#00ad00',
    error: '#ff5a5d',
    errorHover: '#ff4347',
    errorPress: '#ff2d31',
    rating: '#feba17',
    ratingHover: '#fdb000',
    ratingPress: '#fca500',
  },
  
  dark: {
    // Base colors from Figma
    background: '#000000',
    foreground: '#ffffff',
    muted: '#2d2d2d',
    mutedForeground: '#a2a0a0',
    primary: '#9334ea',
    
    // Interactive states
    backgroundHover: '#1a1a1a',
    backgroundPress: '#2d2d2d',
    foregroundHover: '#e6e6e6',
    foregroundPress: '#cccccc',
    primaryHover: '#7c3aed',
    primaryPress: '#6d28d9',
    mutedHover: '#404040',
    mutedPress: '#525252',
    
    // Semantic colors
    green: '#00d900',
    greenHover: '#00c300',
    greenPress: '#00ad00',
    error: '#ff5a5d',
    errorHover: '#ff4347',
    errorPress: '#ff2d31',
    rating: '#feba17',
    ratingHover: '#fdb000',
    ratingPress: '#fca500',
  }
}

// Create the configuration extending base config but with custom themes only
const config = createTamagui({
  ...baseConfig,
  fonts: {
    heading: robotoFont,
    body: robotoFont,
    mono: robotoFont,
    alt: robotoFont,
    display: robotoFont,
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