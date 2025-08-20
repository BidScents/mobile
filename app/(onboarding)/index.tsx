/**
 * Simplified Onboarding Screen Component
 * 
 * Clean onboarding screen using the ProfilePreviewPicker component.
 * All image picking logic is now contained within the preview component.
 * Features:
 * - Form validation with Zod schema
 * - Self-contained image preview and picking
 * - Comprehensive error handling
 * - Loading states and user feedback
 * - Username validation on form submission
 */

import { ControlledInput } from '@/components/forms/controlled-input'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { KeyboardAwareView } from '@/components/ui/keyboard-aware-view'
import { ProfilePreviewPicker } from '@/components/ui/profile-preview-picker'
import { handleOnboarding } from '@/utils/auth-actions'
import { onboardingSchema, type OnboardingFormData } from '@bid-scents/shared-sdk'
import { zodResolver } from '@hookform/resolvers/zod'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { ScrollView } from 'react-native'
import { Text, YStack } from 'tamagui'

/**
 * Extended form data to include local image URIs
 */
interface ExtendedOnboardingData extends OnboardingFormData {
  profileImageUri?: string
  coverImageUri?: string
}

/**
 * Default form values for onboarding
 */
const DEFAULT_VALUES: OnboardingFormData = {
    first_name: '',
    last_name: '',
    username: '',
    bio: '',
    profile_image_url: undefined,
    cover_image_url: undefined,
}

export default function OnboardingScreen() {
  const [isLoading, setIsLoading] = useState(false)
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null)
  const [coverImageUri, setCoverImageUri] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    formState: { isValid }
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    mode: 'onChange',
    defaultValues: DEFAULT_VALUES
  })

  /**
   * Handle form submission
   * 
   * Uploads selected images first, then submits onboarding data.
   * Manages loading state and delegates logic to utility function.
   */
  const onSubmit = async (data: OnboardingFormData) => {
    setIsLoading(true)
    
    try {
      // Create extended data with local image URIs
      const extendedData: ExtendedOnboardingData = {
        ...data,
        profileImageUri: profileImageUri || undefined,
        coverImageUri: coverImageUri || undefined
      }

      await handleOnboarding(extendedData)
    } catch (error) {
      // Error handling is done in the utility function
      // Loading state is cleared here regardless of outcome
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Container backgroundColor="$background" safeArea={['top']} variant="padded">
      <KeyboardAwareView backgroundColor="$background">
        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <YStack flex={1} gap="$5" minHeight="100%">
            {/* Profile Preview with Image Picking */}
            <ProfilePreviewPicker
              profileImageUri={profileImageUri}
              coverImageUri={coverImageUri}
              onProfileImageChange={setProfileImageUri}
              onCoverImageChange={setCoverImageUri}
              disabled={isLoading}
            />
              
            {/* Header Text */}
            <YStack gap="$2">
              <Text color="$foreground" fontSize="$8" fontWeight="600">
                Your Profile
              </Text>
              
              <Text color="$mutedForeground" fontSize="$4" lineHeight="$4">
                Add your details to personalize your experience.
              </Text>
            </YStack>

            {/* Form Section */}
            <YStack gap="$4" flex={1}>
              <ControlledInput
                control={control}
                name="first_name"
                variant="first_name"
                label="First Name"
                placeholder="Enter your first name"
                disabled={isLoading}
              />

              <ControlledInput
                control={control}
                name="last_name"
                variant="last_name"
                label="Last Name"
                placeholder="Enter your last name"
                disabled={isLoading}
              />

              <ControlledInput
                control={control}
                name="username"
                variant="username"
                label="Username"
                placeholder="Choose a unique username"
                disabled={isLoading}
              />

              <ControlledInput
                control={control}
                name="bio"
                variant="bio"
                label="Bio (Optional)"
                placeholder="Tell us a bit about yourself..."
                disabled={isLoading}
              />
            </YStack>
          </YStack>
        </ScrollView>
        
        {/* Submit Button - Fixed at bottom */}
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onPress={handleSubmit(onSubmit)}
          disabled={isLoading || !isValid}
          borderRadius="$10"
        >
          {isLoading ? 'Creating Profile...' : 'Complete Profile'}
        </Button>
      </KeyboardAwareView>
    </Container>
  )
}