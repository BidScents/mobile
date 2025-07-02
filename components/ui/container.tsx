import React from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { View, ViewProps } from 'tamagui'

interface ContainerProps extends Omit<ViewProps, 'backgroundColor'> {
  children: React.ReactNode
  variant?: 'default' | 'padded' | 'centered' | 'fullscreen'
  safeArea?: boolean | 'top' | 'bottom' | 'horizontal'
  backgroundColor?: string
}

/**
 * Base container component that provides consistent layout and safe area handling.
 * Used as the foundation for all screen layouts in the app.
 * 
 * @param variant - Layout style preset (default, padded, centered, fullscreen)
 * @param safeArea - Safe area configuration (true, false, or specific edges)
 * @param backgroundColor - Background color using Tamagui tokens
 */
export const Container: React.FC<ContainerProps> = ({
  children,
  variant = 'default',
  safeArea = true,
  backgroundColor = '$background',
  ...props
}) => {
  const insets = useSafeAreaInsets()

  // Calculate safe area padding based on safeArea prop
  const getSafeAreaPadding = () => {
    if (safeArea === false) return {}
    
    if (safeArea === true) {
      return {
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }
    }
    
    if (safeArea === 'top') return { paddingTop: insets.top }
    if (safeArea === 'bottom') return { paddingBottom: insets.bottom }
    if (safeArea === 'horizontal') {
      return {
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }
    }
    
    return {}
  }

  // Variant-specific props
  const getVariantProps = () => {
    switch (variant) {
      case 'padded':
        return {
          flex: 1,
          padding: '$4',
        }
      case 'centered':
        return {
          flex: 1,
          justifyContent: 'center' as const,
          alignItems: 'center' as const,
          padding: '$4',
        }
      case 'fullscreen':
        return {
          flex: 1,
        }
      case 'default':
      default:
        return {
          flex: 1,
          paddingHorizontal: '$4',
        }
    }
  }

  const safeAreaPadding = getSafeAreaPadding()
  const variantProps = getVariantProps()

  return (
    <View
      backgroundColor={backgroundColor}
      style={safeAreaPadding}
      {...variantProps}
      {...props}
    >
      {children}
    </View>
  )
}