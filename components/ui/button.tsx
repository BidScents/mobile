import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import React from 'react'
import type { ButtonProps as TamaguiButtonProps } from 'tamagui'
import { Button as TamaguiButton, Text } from 'tamagui'

/**
 * Button variants for the BidScents marketplace
 */
export type ButtonVariant = 
  | 'primary'     // Main actions (purple)
  | 'secondary'   // Secondary actions (muted)
  | 'outline'     // Outlined actions (border only)
  | 'success'     // Success actions (green)
  | 'destructive' // Dangerous actions (red)
  | 'ghost'       // Minimal actions

/**
 * Button size options
 */
export type ButtonSize = 'sm' | 'md' | 'lg'

/**
 * Props for the Button component
 */
export interface ButtonProps extends Omit<TamaguiButtonProps, 'size' | 'variant'> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  onPress?: () => void | Promise<void>
  /** Icon to display on the left side */
  leftIcon?: keyof typeof Ionicons.glyphMap
  /** Icon to display on the right side */
  rightIcon?: keyof typeof Ionicons.glyphMap
  /** Only show icon without text (makes button circular/square) */
  iconOnly?: boolean
  /** Custom border radius */
  borderRadius?: string
  /** Whether to trigger haptic feedback on press */
  haptic?: boolean
}

/**
 * Button component for the BidScents marketplace.
 * Uses Tamagui theming system with custom color tokens and supports Ionicons.
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  children,
  disabled,
  onPress,
  leftIcon,
  rightIcon,
  iconOnly = false,
  borderRadius = '$6',
  haptic = true,
  ...rest
}) => {
  const handlePress = React.useCallback(async () => {
    if (!onPress || disabled) return
    if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    await onPress()
  }, [onPress, disabled, haptic])

  // Size configurations
  const sizeProps = {
    sm: { 
      height: '$3', 
      paddingHorizontal: iconOnly ? '$2' : '$3', 
      fontSize: '$4',
      width: iconOnly ? '$3' : 'auto'
    },
    md: { 
      height: '$4', 
      paddingHorizontal: iconOnly ? '$2.5' : '$4', 
      fontSize: '$5',
      width: iconOnly ? '$4' : 'auto'
    },
    lg: { 
      height: '$5', 
      paddingHorizontal: iconOnly ? '$3' : '$5', 
      fontSize: '$6',
      width: iconOnly ? '$5' : 'auto'
    },
  }

  // Icon sizes based on button size
  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  }

  // Variant configurations using theme tokens
  const variantProps = {
    primary: {
      backgroundColor: '$foreground',
      color: '$background',
      hoverStyle: { backgroundColor: '$foregroundHover' },
      pressStyle: { backgroundColor: '$foregroundPress' },
    },
    secondary: {
      backgroundColor: '$muted',
      color: '$foreground',
      hoverStyle: { backgroundColor: '$mutedHover' },
      pressStyle: { backgroundColor: '$mutedPress' },
    },
    outline: {
      backgroundColor: '$background',
      color: '$foreground',
      borderWidth: 1,
      borderColor: '$foreground',
      hoverStyle: { 
        backgroundColor: '$backgroundHover',
        borderColor: '$foregroundHover',
      },
      pressStyle: { 
        backgroundColor: '$backgroundPress',
        borderColor: '$foregroundPress',
      },
    },
    success: {
      backgroundColor: '$success',
      color: '$background',
      hoverStyle: { backgroundColor: '$successHover' },
      pressStyle: { backgroundColor: '$successPress' },
    },
    destructive: {
      backgroundColor: '$error',
      color: '$background',
      hoverStyle: { backgroundColor: '$errorHover' },
      pressStyle: { backgroundColor: '$errorPress' },
    },
    ghost: {
      backgroundColor: 'transparent',
      color: '$foreground',
      hoverStyle: { backgroundColor: '$backgroundHover' },
      pressStyle: { backgroundColor: '$backgroundPress' },
    },
  }

  // Get actual color values for icons based on variant
  const getIconColor = (variant: ButtonVariant) => {
    switch (variant) {
      case 'primary':
      case 'success':
      case 'destructive':
        return '#ffffff' // White for colored backgrounds
      case 'secondary':
      case 'outline':
      case 'ghost':
        return '#000000' // Black for light backgrounds
      default:
        return '#000000'
    }
  }

  const iconColor = getIconColor(variant)

  return (
    <TamaguiButton
      {...sizeProps[size]}
      {...variantProps[variant]}
      width={fullWidth ? '100%' : sizeProps[size].width}
      disabled={disabled}
      opacity={disabled ? 0.6 : 1}
      cursor={disabled ? 'not-allowed' : 'pointer'}
      gap={iconOnly ? 0 : '$2'}
      alignItems="center"
      justifyContent="center"
      onPress={handlePress}
      borderRadius={borderRadius}
      {...rest}
    >
      {leftIcon && (
        <Ionicons 
          name={leftIcon} 
          size={iconSizes[size]} 
          color={iconColor}
        />
      )}
      
      {!iconOnly && (
        <Text textTransform="none" fontWeight="600" fontSize={sizeProps[size].fontSize} color={variantProps[variant].color}>
          {children}
        </Text>
      )}
      
      {rightIcon && (
        <Ionicons 
          name={rightIcon} 
          size={iconSizes[size]} 
          color={iconColor}
        />
      )}
    </TamaguiButton>
  )
}

export default Button