import type { InputVariant, SelectOption } from '@/components/ui/input'
import { Input } from '@/components/ui/input'
import React from 'react'
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form'

interface ControlledInputProps<T extends FieldValues> {
  control: Control<T>
  name: FieldPath<T>
  variant?: InputVariant
  label: string
  placeholder: string
  disabled?: boolean
  numberOfLines?: number
  options?: SelectOption[]
  selectTitle?: string
  selectSubtitle?: string
  switchChecked?: boolean
}

export function ControlledInput<T extends FieldValues>({
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
  switchChecked,
}: ControlledInputProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        const handleChange = (text: string) => {
          if (variant === 'numeric') {
            // Allow empty string to remain as empty string, don't convert to undefined
            // This prevents React Hook Form from reverting to default values
            if (text === '') {
              onChange('')
            } else {
              const numValue = parseFloat(text)
              onChange(isNaN(numValue) ? text : numValue)
            }
          }
          else {
            onChange(text)
          }
        }

        const handleSwitchChange = (checked: boolean) => {
          if (variant === 'switch') {
            onChange(checked)
          }
        }

        const displayValue = () => {
          if (variant === 'numeric') {
            // Handle both number and string values
            if (value === '' || value === undefined || value === null) {
              return ''
            }
            return value.toString()
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
            switchChecked={switchChecked}
            onSwitchChange={handleSwitchChange}
            error={error?.message}
          />
        )
      }}
    />
  )
}
