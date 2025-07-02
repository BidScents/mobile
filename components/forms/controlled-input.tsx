import type { InputVariant } from '@/components/ui/input'
import { Input } from '@/components/ui/input'
import React from 'react'
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form'
import { Text, YStack } from 'tamagui'

interface ControlledInputProps<T extends FieldValues> {
  control: Control<T>
  name: FieldPath<T>
  variant?: InputVariant
  label: string
  placeholder: string
  disabled?: boolean
  numberOfLines?: number
}

export function ControlledInput<T extends FieldValues>({
  control,
  name,
  variant = 'text',
  label,
  placeholder,
  disabled = false,
  numberOfLines
}: ControlledInputProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <YStack gap="$2">
          <Input
            variant={variant}
            label={label}
            placeholder={placeholder}
            value={value || ''}
            onChangeText={onChange}
            disabled={disabled}
            numberOfLines={numberOfLines}
          />
          {error && (
            <Text 
              fontSize="$2" 
              color="$error"
              textTransform="none"
              fontWeight="400"
            >
              {error.message}
            </Text>
          )}
        </YStack>
      )}
    />
  )
}