import { ControlledInput } from "@/components/forms/controlled-input";
import { QuickActionBottomSheet } from "@/components/forms/quick-action-bottom-sheet";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { KeyboardAwareView } from "@/components/ui/keyboard-aware-view";
import { ProfilePreviewPicker } from "@/components/ui/profile-preview-picker";
import { useEditProfile } from "@/hooks/queries/use-profile";
import { ImageUploadConfigs, uploadSingleImage } from "@/utils/image-upload-service";
import {
  onboardingSchema,
  useAuthStore,
  type OnboardingFormData
} from "@bid-scents/shared-sdk";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { ScrollView, YStack } from "tamagui";

export default function EditProfileScreen() {
  const { user } = useAuthStore();
  const editProfileMutation = useEditProfile();
  const quickActionBottomSheetRef = useRef<BottomSheetModalMethods>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [disabled, setDisabled] = useState(true);

  const [profileImageUri, setProfileImageUri] = useState<string | null>(
    user?.profile_image_url
      ? `${process.env.EXPO_PUBLIC_IMAGE_BASE_URL}${user.profile_image_url}`
      : null
  );
  const [coverImageUri, setCoverImageUri] = useState<string | null>(
    user?.cover_image_url
      ? `${process.env.EXPO_PUBLIC_IMAGE_BASE_URL}${user.cover_image_url}`
      : null
  );

  const { control, handleSubmit, watch } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      username: user?.username || "",
      bio: user?.bio || "",
      profile_image_url: user?.profile_image_url || undefined,
      cover_image_url: user?.cover_image_url || undefined,
    },
  });

  /**
   * Used for comparing current images with stored image paths
   */
  const formatImageUri = (uri: string): string => {
    return uri.replace(process.env.EXPO_PUBLIC_IMAGE_BASE_URL!, "");
  };

  /**
   * Change detection - determines if any field has been modified
   * This prevents unnecessary API calls when no changes are made
   */
  const isCoverImageChanged =
    formatImageUri(coverImageUri || "") !== (user?.cover_image_url || "");
  const isProfileImageChanged =
    formatImageUri(profileImageUri || "") !== (user?.profile_image_url || "");
  const isUsernameChanged = watch("username") !== user?.username;
  const isBioChanged = watch("bio") !== user?.bio;
  const isFirstNameChanged = watch("first_name") !== user?.first_name;
  const isLastNameChanged = watch("last_name") !== user?.last_name;

  const isAnyChange =
    isCoverImageChanged ||
    isProfileImageChanged ||
    isUsernameChanged ||
    isBioChanged ||
    isFirstNameChanged ||
    isLastNameChanged;

  /**
   * Handles form submission with validation and image uploads
   *
   * Process:
   * 1. Validate username uniqueness if changed
   * 2. Upload new images if they were changed
   * 3. Submit updated profile data to API
   * 4. Handle errors and loading states
   */
  const onSubmit = async (data: OnboardingFormData) => {
    setIsLoading(true);

    try {
      // Handle image uploads only if images were changed and exist
      let profileImage = user?.profile_image_url;
      if (isProfileImageChanged) {
        if (profileImageUri) {
          // Upload new image
          const result = await uploadSingleImage(profileImageUri, ImageUploadConfigs.profile("profile"));
          profileImage = `profile-images/${result.path}`;
        } else {
          // Image was removed
          profileImage = null;
        }
      }

      let coverImage = user?.cover_image_url;
      if (isCoverImageChanged) {
        if (coverImageUri) {
          // Upload new image
          const result = await uploadSingleImage(coverImageUri, ImageUploadConfigs.profile("cover"));
          coverImage = `profile-images/${result.path}`;
        } else {
          // Image was removed
          coverImage = null;
        }
      }

      // Submit updated profile data
      await editProfileMutation.mutateAsync({
        userId: user?.id!,
        data: {
          ...data,
          profile_image_url: profileImage,
          cover_image_url: coverImage,
        },
      });
      router.back();
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProfile = () => {
    quickActionBottomSheetRef.current?.present();
  };

  return (
    <ScrollView
      backgroundColor="$background"
      contentInsetAdjustmentBehavior="automatic"
    >
      <Container
        variant="padded"
        safeArea={["bottom"]}
        backgroundColor="$background"
      >
        <KeyboardAwareView backgroundColor="$background">
          <YStack
            flex={1}
            gap="$3"
            minHeight="100%"
            onPress={disabled ? handleEditProfile : undefined}
          >
            {/* Profile Image Section */}
            <ProfilePreviewPicker
              profileImageUri={profileImageUri}
              coverImageUri={coverImageUri}
              onProfileImageChange={setProfileImageUri}
              onCoverImageChange={setCoverImageUri}
              disabled={isLoading || disabled}
            />

            {/* Form Fields Section */}
            <YStack gap="$3" flex={1}>
              {/* Personal Information */}
              <ControlledInput
                control={control}
                name="first_name"
                variant="first_name"
                label="First Name"
                placeholder="Enter your first name"
                disabled={isLoading || disabled}
              />

              <ControlledInput
                control={control}
                name="last_name"
                variant="last_name"
                label="Last Name"
                placeholder="Enter your last name"
                disabled={isLoading || disabled}
              />

              {/* Account Information */}
              <ControlledInput
                control={control}
                name="username"
                variant="username"
                label="Username"
                placeholder="Choose a unique username"
                disabled={isLoading || disabled}
              />

              <ControlledInput
                control={control}
                name="bio"
                variant="bio"
                label="Bio (Optional)"
                placeholder="Tell us a bit about yourself..."
                disabled={isLoading || disabled}
              />

              {/* Submit Button - Only shown when editing is enabled */}
              {!disabled && (
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onPress={handleSubmit(onSubmit)}
                  disabled={isLoading || !isAnyChange}
                  borderRadius="$10"
                >
                  {isLoading ? "Updating Profile..." : "Update Profile"}
                </Button>
              )}
            </YStack>
          </YStack>
        </KeyboardAwareView>
      </Container>

      {/* Edit Confirmation Modal */}
      <QuickActionBottomSheet
        ref={quickActionBottomSheetRef}
        title="Edit Profile"
        subtitle="Are you sure you want to edit your profile?"
        primaryOption="Edit"
        secondaryOption="Cancel"
        onSelectPrimary={() => setDisabled(false)}
        onSelectSecondary={() => quickActionBottomSheetRef.current?.dismiss()}
      />
    </ScrollView>
  );
}
