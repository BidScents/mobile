// tamagui.config.ts
import { createTamagui, createTokens, createFont } from '@tamagui/core'
import { config as baseConfig } from '@tamagui/config/v3'
import { color, radius, size, space, zIndex } from '@tamagui/themes'

// Create Roboto font configuration
const robotoFont = createFont({
  family: 'Roboto, system-ui, sans-serif',
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

// Custom theme overrides (optional)
const customThemes = {
  light: {
    // Override specific light theme colors if needed
    // background: '#ffffff',
    // color: '#000000',
    // borderColor: '#e5e5e5',
  },
  dark: {
    // Override specific dark theme colors if needed
    // background: '#000000',
    // color: '#ffffff',
    // borderColor: '#2a2a2a',
  },
}

// Create the configuration extending base config
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
  themes: {
    ...baseConfig.themes,
    // Merge custom theme overrides
    ...Object.keys(customThemes).reduce((acc, themeName) => {
      acc[themeName] = {
        ...baseConfig.themes?.[themeName],
        ...customThemes[themeName],
      }
      return acc
    }, {} as any),
  },
})

export type AppConfig = typeof config

declare module '@tamagui/core' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config