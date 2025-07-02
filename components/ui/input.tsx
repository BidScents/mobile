import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@tamagui/core'
import React, { useState } from 'react'
import type { KeyboardTypeOptions } from 'react-native'
import { Paragraph, Input as TamaguiInput, TextArea, XStack, YStack } from 'tamagui'

/**
 * Input variant types
 */
export type InputVariant = 
  | 'text'
  | 'email' 
  | 'password'
  | 'username'       
  | 'first_name'     
  | 'last_name'      
  | 'bio'            
  | 'multiline'

/**
 * Props for the Input component
 */
export interface InputProps {
  /** Input variant that determines behavior and styling */
  variant?: InputVariant
  /** Input label displayed above the field */
  label: string
  /** Placeholder text */
  placeholder: string
  /** Input value (controlled by forms component) */
  value: string
  /** Change handler (controlled by forms component) */
  onChangeText: (text: string) => void
  /** Whether the field has been touched (for validation display) */
  touched?: boolean
  /** Error message displayed when validation fails (passed from forms) */
  error?: string
  /** Number of lines for multiline variants */
  numberOfLines?: number
  /** Whether the input is disabled */
  disabled?: boolean
}

/**
 * Simple, clean Input component
 */
export const Input: React.FC<InputProps> = ({
  variant = 'text',
  label,
  placeholder,
  value,
  onChangeText,
  touched = false,
  error,
  numberOfLines,
  disabled = false,
}) => {
  const theme = useTheme()
  const [showPassword, setShowPassword] = useState(false)

  // Get variant-specific configuration
  const getVariantConfig = (variant: InputVariant) => {
    switch (variant) {
      case 'email':
        return {
          keyboardType: 'email-address' as KeyboardTypeOptions,
          textContentType: 'emailAddress' as const,
          autoComplete: 'email' as const,
          autoCapitalize: 'none' as const,
          autoCorrect: false,
        }
      case 'password':
        return {
          secureTextEntry: !showPassword,
          textContentType: 'password' as const,
          autoComplete: 'password' as const,
          autoCapitalize: 'none' as const,
          autoCorrect: false,
        }
      case 'username':
        return {
          textContentType: 'username' as const,
          autoComplete: 'username' as const,
          autoCapitalize: 'none' as const,
          autoCorrect: false,
        }
      case 'first_name':
        return {
          textContentType: 'givenName' as const,
          autoComplete: 'given-name' as const,
          autoCapitalize: 'words' as const,
          autoCorrect: true,
        }
      case 'last_name':
        return {
          textContentType: 'familyName' as const,
          autoComplete: 'family-name' as const,
          autoCapitalize: 'words' as const,
          autoCorrect: true,
        }
      case 'bio':
        return {
          textContentType: 'none' as const,
          autoComplete: 'off' as const,
          autoCapitalize: 'sentences' as const,
          autoCorrect: true,
          isMultiline: true,
        }
      case 'multiline':
        return {
          textContentType: 'none' as const,
          autoComplete: 'off' as const,
          autoCapitalize: 'sentences' as const,
          isMultiline: true,
        }
      default:
        return {
          textContentType: 'none' as const,
          autoComplete: 'off' as const,
          autoCapitalize: 'none' as const,
        }
    }
  }

  const config = getVariantConfig(variant)
  const isMultiline = config.isMultiline || variant === 'bio' || variant === 'multiline'
  const finalNumberOfLines = numberOfLines || (variant === 'bio' ? 4 : 3)
  const isPassword = variant === 'password'

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  // Input props for Tamagui component
  const inputProps = {
    placeholder,
    onChangeText,
    keyboardType: config.keyboardType || 'default',
    textContentType: config.textContentType,
    autoComplete: config.autoComplete,
    autoCapitalize: config.autoCapitalize,
    autoCorrect: config.autoCorrect,
    secureTextEntry: config.secureTextEntry,
    size: "$5" as const,
    height: isMultiline ? undefined : 50,
    borderRadius: "$6",
    width: "100%",
    color: "$foreground",
    borderWidth: 0,
    placeholderTextColor: "$mutedForeground",
    backgroundColor: "$background",
    px: "$4",
    py: isMultiline ? "$3" : undefined,
    fontWeight: "400",
    disabled,
  }

  return (
    <YStack borderRadius="$6" width="100%" gap="$2">
      <Paragraph fontWeight="400" color="$mutedForeground">
        {label}
      </Paragraph>
      
      {isPassword ? (
        <XStack
          alignItems="center"
          borderRadius="$6"
          backgroundColor="$background"
          pr="$3"
        >
          <TamaguiInput
            flex={1}
            {...inputProps}
            backgroundColor="transparent"
            borderRadius="$6"
          />
          <Ionicons
            name={showPassword ? 'eye-off' : 'eye'}
            size={20}
            color={theme.mutedForeground?.val || '#666'}
            onPress={togglePasswordVisibility}
            style={{ cursor: 'pointer' }}
          />
        </XStack>
      ) : isMultiline ? (
        <TextArea
          numberOfLines={finalNumberOfLines}
          {...inputProps}
        />
      ) : (
        <TamaguiInput {...inputProps} />
      )}
      
      {touched && error && (
        <Paragraph size="$2" color="$destructive">
          {error}
        </Paragraph>
      )}
    </YStack>
  )
}

export default Input