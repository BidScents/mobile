import React from 'react'
import { Edge, SafeAreaView } from 'react-native-safe-area-context'
import { View, ViewProps, useTheme } from 'tamagui'

interface ContainerProps extends ViewProps {
  children: React.ReactNode
  variant?: 'default' | 'padded' | 'centered' | 'fullscreen'
  safeArea?: boolean | Edge[]
  backgroundColor?: string
}

/**
 * Container component that combines SafeAreaView with layout variants.
 * Provides consistent screen layouts with proper safe area handling.
 * 
 * @param variant - Layout style preset
 * @param safeArea - Safe area edges (true for all, array for specific edges, false for none)
 */
export const Container: React.FC<ContainerProps> = ({
  children,
  variant = 'default',
  safeArea = true,
  backgroundColor = '$background',
  ...props
}) => {
  const theme = useTheme()

  // Convert safeArea prop to edges array
  const getEdges = (): Edge[] => {
    if (safeArea === false) return []
    if (safeArea === true) return ['top', 'bottom', 'left', 'right']
    return safeArea
  }

  // Get variant-specific props
  const getVariantProps = () => {
    switch (variant) {
      case 'padded':
        return {
          flex: 1,
          padding: '$4',
          paddingVertical: '$2',
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

  return (
    <SafeAreaView 
      style={{ flex: 1, backgroundColor: theme.background.get() }} 
      edges={getEdges()}
    >
      <View
        backgroundColor={backgroundColor}
        {...getVariantProps()}
        {...props}
      >
        {children}
      </View>
    </SafeAreaView>
  )
}