import { MultipleImagePicker } from '@/components/ui/multiple-image-picker'
import React from 'react'
import { Text, YStack } from 'tamagui'

interface ControlledMultipleImagePickerProps {
  imageUris: string[]
  onImagesChange: (uris: string[]) => void
  disabled?: boolean
  maxImages?: number
  required?: boolean
  label?: string
}

export function ControlledMultipleImagePicker({
  imageUris,
  onImagesChange,
  disabled = false,
  maxImages = 10,
  required = false,
  label = "Photos"
}: ControlledMultipleImagePickerProps) {
  const hasError = required && imageUris.length === 0

  return (
    <YStack gap="$2">
      <MultipleImagePicker
        imageUris={imageUris}
        onImagesChange={onImagesChange}
        disabled={disabled}
        maxImages={maxImages}
        label={label}
      />
      {hasError && (
        <Text 
          fontSize="$2" 
          color="$error"
          textTransform="none"
          fontWeight="400"
        >
          At least one image is required
        </Text>
      )}
    </YStack>
  )
}
