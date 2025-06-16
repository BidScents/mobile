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

// Custom themes - light and dark only
const customThemes = {
  light: {
    background: '#ffffff',
    backgroundHover: '#f5f5f5',
    backgroundPress: '#eeeeee',
    backgroundFocus: '#e3f2fd',
    backgroundStrong: '#f9f9f9',
    backgroundTransparent: 'rgba(255,255,255,0)',
    color: '#212121',
    colorHover: '#424242',
    colorPress: '#616161',
    colorFocus: '#1976d2',
    colorTransparent: 'rgba(33,33,33,0)',
    borderColor: '#e0e0e0',
    borderColorHover: '#bdbdbd',
    borderColorPress: '#9e9e9e',
    borderColorFocus: '#1976d2',
    placeholderColor: '#9e9e9e',
    // Semantic colors
    blue: '#2196f3',
    blueHover: '#1976d2',
    bluePress: '#1565c0',
    blueFocus: '#0d47a1',
    green: '#4caf50',
    greenHover: '#388e3c',
    greenPress: '#2e7d32',
    greenFocus: '#1b5e20',
    red: '#f44336',
    redHover: '#d32f2f',
    redPress: '#c62828',
    redFocus: '#b71c1c',
    yellow: '#ff9800',
    yellowHover: '#f57c00',
    yellowPress: '#ef6c00',
    yellowFocus: '#e65100',
    purple: '#9c27b0',
    purpleHover: '#7b1fa2',
    purplePress: '#6a1b9a',
    purpleFocus: '#4a148c',
  },
  dark: {
    background: '#121212',
    backgroundHover: '#1e1e1e',
    backgroundPress: '#2a2a2a',
    backgroundFocus: '#1a237e',
    backgroundStrong: '#0a0a0a',
    backgroundTransparent: 'rgba(18,18,18,0)',
    color: '#ffffff',
    colorHover: '#e0e0e0',
    colorPress: '#bdbdbd',
    colorFocus: '#64b5f6',
    colorTransparent: 'rgba(255,255,255,0)',
    borderColor: '#2a2a2a',
    borderColorHover: '#3a3a3a',
    borderColorPress: '#4a4a4a',
    borderColorFocus: '#64b5f6',
    placeholderColor: '#757575',
    // Semantic colors
    blue: '#64b5f6',
    blueHover: '#42a5f5',
    bluePress: '#2196f3',
    blueFocus: '#1976d2',
    green: '#81c784',
    greenHover: '#66bb6a',
    greenPress: '#4caf50',
    greenFocus: '#388e3c',
    red: '#e57373',
    redHover: '#ef5350',
    redPress: '#f44336',
    redFocus: '#d32f2f',
    yellow: '#ffb74d',
    yellowHover: '#ffa726',
    yellowPress: '#ff9800',
    yellowFocus: '#f57c00',
    purple: '#ba68c8',
    purpleHover: '#ab47bc',
    purplePress: '#9c27b0',
    purpleFocus: '#7b1fa2',
  },
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
})

export type AppConfig = typeof config

declare module '@tamagui/core' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config