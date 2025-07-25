import type { InputVariant, SelectOption } from '@/components/ui/input'
import { Input } from '@/components/ui/input'
import type { CreateListingFormData } from '@/utils/create-listing-schema'
import React from 'react'
import { Controller, type Control } from 'react-hook-form'

interface ControlledInputProps {
  control: Control<CreateListingFormData>
  name: keyof CreateListingFormData
  variant?: InputVariant
  label: string
  placeholder: string
  disabled?: boolean
  numberOfLines?: number
  options?: SelectOption[]
  selectTitle?: string
  selectSubtitle?: string
}

export function ControlledInput({
  control,
  name,
  variant = 'text',
  label,
  placeholder,
  disabled = false,
  numberOfLines,
  options,
  selectTitle,
  selectSubtitle,
}: ControlledInputProps) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        const handleChange = (text: string) => {
          if (variant === 'numeric') {
            const numValue = text === '' ? undefined : parseFloat(text)
            onChange(numValue)
          } else {
            onChange(text)
          }
        }

        const displayValue = () => {
          if (variant === 'numeric') {
            return value?.toString() || ''
          }
          return (value as string) || ''
        }

        return (
          <Input
            variant={variant}
            label={label}
            placeholder={placeholder}
            value={displayValue()}
            onChangeText={handleChange}
            disabled={disabled}
            numberOfLines={numberOfLines}
            options={options}
            selectTitle={selectTitle}
            selectSubtitle={selectSubtitle}
            error={error?.message}
          />
        )
      }}
    />
  )
}
