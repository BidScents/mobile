import { Ionicons } from '@expo/vector-icons'
import { styled } from '@tamagui/core'

export const ThemedIonicons = styled(Ionicons, {
  color: '$foreground',
  
  variants: {
    themeColor: {
      foreground: {
        color: '$foreground'
      },
      primary: {
        color: '$primary'
      },
      muted: {
        color: '$mutedForeground'
      },
      success: {
        color: '$success'
      },
      error: {
        color: '$error'
      },
      rating: {
        color: '$rating'
      },
      red: {
        color: 'red'
      }
    }
  }
})