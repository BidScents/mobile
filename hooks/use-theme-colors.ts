import { useMemo } from 'react'
import { useTheme } from 'tamagui'

/**
 * Custom hook that provides theme colors with a single rerender when theme changes.
 * Uses actual Tamagui theme values instead of hardcoded colors.
 */
export const useThemeColors = () => {
  const theme = useTheme()
  
  return useMemo(() => ({
    foreground: theme.foreground.val,
    background: theme.background.val,
    muted: theme.muted.val,
    mutedForeground: theme.mutedForeground.val,
    primary: theme.primary.val,
    secondary: theme.secondary?.val,
    success: theme.success?.val,
    error: theme.error?.val,
    warning: theme.warning?.val,
    border: theme.borderColor?.val || theme.foreground.val,
    placeholder: theme.placeholderColor?.val || theme.mutedForeground.val,
    blurTint: theme.blurTint?.val,
  }), [
    theme.foreground.val,
    theme.background.val,
    theme.muted.val,
    theme.mutedForeground.val,
    theme.primary.val,
    theme.secondary?.val,
    theme.success?.val,
    theme.error?.val,
    theme.warning?.val,
    theme.borderColor?.val,
    theme.placeholderColor?.val,
    theme.blurTint?.val,
  ])
}