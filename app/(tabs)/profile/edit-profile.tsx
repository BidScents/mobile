import { ControlledInput } from "@/components/forms/controlled-input";
import { QuickActionBottomSheet } from "@/components/forms/quick-action-bottom-sheet";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { KeyboardAwareView } from "@/components/ui/keyboard-aware-view";
import { ProfilePreviewPicker } from "@/components/ui/profile-preview-picker";
import { useEditProfile } from "@/hooks/queries/use-profile";
import { uploadProfileImage } from "@/utils/upload-profile-image";
import {
  onboardingSchema,
  useAuthStore,
  type OnboardingFormData,
} from "@bid-scents/shared-sdk";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { ScrollView, YStack } from "tamagui";

export default function EditProfileScreen() {
  const { user } = useAuthStore();
  const [profileImageUri, setProfileImageUri] = useState<string | null>(
    `${process.env.EXPO_PUBLIC_IMAGE_BASE_URL}${user?.profile_image_url}` ||
      null
  );
  const [coverImageUri, setCoverImageUri] = useState<string | null>(
    `${process.env.EXPO_PUBLIC_IMAGE_BASE_URL}${user?.cover_image_url}` || null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const editProfileMutation = useEditProfile();
  const quickActionBottomSheetRef = useRef<BottomSheetModalMethods>(null);

  const DEFAULT_VALUES: OnboardingFormData = {
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    username: user?.username || "",
    bio: user?.bio || "",
    profile_image_url: user?.profile_image_url || undefined,
    cover_image_url: user?.cover_image_url || undefined,
  };

  const {
    control,
    handleSubmit,
    watch,
    formState: { isValid },
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const formatImageUri = (uri: string) => {
    return uri.replace(process.env.EXPO_PUBLIC_IMAGE_BASE_URL!, "");
  };

  console.log("Profile Image Uri:", profileImageUri);
  console.log("Cover Image Uri:", coverImageUri);

  const onSubmit = async (data: OnboardingFormData) => {
    setIsLoading(true);
    try {
      const profileImage = profileImageUri
        ? await uploadProfileImage(profileImageUri, "profile")
        : undefined;
      const coverImage = coverImageUri
        ? await uploadProfileImage(coverImageUri, "cover")
        : undefined;
      console.log("Profile Image:", profileImage);
      console.log("Cover Image:", coverImage);
      await editProfileMutation.mutateAsync({
        userId: user?.id!,
        data: {
          ...data,
          profile_image_url: `profile-images/${formatImageUri(profileImage!)}`,
          cover_image_url: `profile-images/${formatImageUri(coverImage!)}`,
        },
      });
    } catch (error) {
      console.error("Error submitting onboarding:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProfile = () => {
    quickActionBottomSheetRef.current?.present()
  }

  // console.log(watch());
  // console.log("profileImageUri", profileImageUri);
  // console.log("coverImageUri", coverImageUri);

  return (
    <ScrollView
      paddingHorizontal="$4"
      backgroundColor="$background"
      contentInsetAdjustmentBehavior="automatic"
    >
      <Container
        variant="fullscreen"
        safeArea={["bottom"]}
        backgroundColor="$background"
      >
        <KeyboardAwareView backgroundColor="$background">
          <YStack
            flex={1}
            gap="$5"
            minHeight="100%"
            onPress={() => handleEditProfile()}
          >
            {/* Profile Preview with Image Picking */}
            <ProfilePreviewPicker
              profileImageUri={profileImageUri}
              coverImageUri={coverImageUri}
              onProfileImageChange={setProfileImageUri}
              onCoverImageChange={setCoverImageUri}
              disabled={isLoading || disabled}
            />

            {/* Form Section */}
            <YStack gap="$4" flex={1}>
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

              {!disabled && (
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onPress={handleSubmit(onSubmit)}
                  disabled={isLoading}
                  borderRadius="$10"
                >
                  {isLoading ? "Updating Profile..." : "Update Profile"}
                </Button>
              )}
            </YStack>
          </YStack>
        </KeyboardAwareView>
      </Container>
      <QuickActionBottomSheet
        title="Edit Profile"
        subtitle="Are you sure you want to edit your profile?"
        primaryOption="Edit"
        secondaryOption="Cancel"
        onSelectPrimary={() => setDisabled(false)}
        onSelectSecondary={() => quickActionBottomSheetRef.current?.dismiss()}
        ref={quickActionBottomSheetRef}
      />
    </ScrollView>
  );
}
