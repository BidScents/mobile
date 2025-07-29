/**
 * Profile Preview Picker Component with Permissions
 *
 * Self-contained component that handles both UI display and image picking logic
 * for cover photo and profile avatar. Includes proper permission handling.
 * Features:
 * - Cover photo with bottom-edge positioned profile avatar
 * - Built-in image picking functionality with permission requests
 * - Loading states and error handling
 * - Clean separation from parent component
 */

import { Button } from "@/components/ui/button";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import * as ImagePicker from "expo-image-picker";
import React, { useRef } from "react";
import { Alert, Linking } from "react-native";
import { Image, Text, YStack } from "tamagui";
import { QuickActionBottomSheet } from "../forms/quick-action-bottom-sheet";

interface ProfilePreviewPickerProps {
  profileImageUri?: string | null;
  coverImageUri?: string | null;
  onProfileImageChange: (uri: string | null) => void;
  onCoverImageChange: (uri: string | null) => void;
  disabled?: boolean;
  setIsDisabled?: (disabled: boolean) => void;
}

export function ProfilePreviewPicker({
  profileImageUri,
  coverImageUri,
  onProfileImageChange,
  onCoverImageChange,
  disabled = false,
  setIsDisabled,
}: ProfilePreviewPickerProps) {
  const quickActionBottomSheetRef = useRef<BottomSheetModalMethods>(null);

  const quickActionEdit = () => {
    quickActionBottomSheetRef.current?.present();
  };

  /**
   * Request media library permissions
   */
  const requestPermissions = async (): Promise<boolean> => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status === "granted") {
        return true;
      }

      if (status === "denied") {
        Alert.alert(
          "Permission Required",
          "This app needs access to your photo library to select images. Please enable it in Settings.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: () => Linking.openSettings() },
          ]
        );
      }

      return false;
    } catch (error) {
      console.error("Permission request failed:", error);
      Alert.alert("Error", "Failed to request permissions");
      return false;
    }
  };

  /**
   * Handle profile image selection with permission check
   */
  const pickProfileImage = async () => {
    // Check permissions first
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // Fixed deprecated warning
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.3,
      });

      if (!result.canceled && result.assets[0]) {
        onProfileImageChange(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Profile image selection failed:", error);
      Alert.alert("Error", "Failed to select profile image");
    }
  };

  /**
   * Handle cover image selection with permission check
   */
  const pickCoverImage = async () => {
    // Check permissions first
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // Fixed deprecated warning
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.3,
      });

      if (!result.canceled && result.assets[0]) {
        onCoverImageChange(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Cover image selection failed:", error);
      Alert.alert("Error", "Failed to select cover image");
    }
  };

  const AVATAR_SIZE = 100;
  const COVER_HEIGHT = 130;
  const AVATAR_OVERLAP = AVATAR_SIZE * 0.5;

  return (
    <YStack>
      {/* Cover Image Container with Avatar Positioned at Bottom */}
      <YStack
        position="relative"
        height={COVER_HEIGHT}
        backgroundColor="$background"
        borderRadius="$6"
        overflow="visible" // Allow avatar to extend beyond cover
        marginBottom={AVATAR_SIZE - AVATAR_OVERLAP} // Space for avatar extending below
      >
        {/* Cover Image Background */}
        <YStack height="100%" borderRadius="$6" overflow="hidden">
          {coverImageUri ? (
            <Image
              source={{ uri: coverImageUri }}
              width="100%"
              height="100%"
              accessibilityLabel="Cover Photo"
            />
          ) : (
            <YStack
              flex={1}
              backgroundColor="$background"
              justifyContent="center"
              alignItems="center"
              borderWidth={2}
              borderStyle="dashed"
              borderRadius="$6"
              borderColor="$mutedForeground"
            >
              <Text color="$foreground" fontSize="$6">
                Cover Photo
              </Text>
            </YStack>
          )}
        </YStack>

        {/* Cover Photo Camera Button */}
        <YStack
          position="absolute"
          top="$3"
          right="$3"
          backgroundColor="$background"
          borderRadius="$10"
          elevation={2}
          shadowColor="$shadowColor"
          shadowOffset={{ width: 0, height: 1 }}
          shadowOpacity={0.1}
          shadowRadius={3}
        >
          <Button
            variant="ghost"
            iconOnly
            size="sm"
            onPress={disabled ? quickActionEdit : pickCoverImage}
            leftIcon="camera"
          />
        </YStack>

        {/* Profile Avatar - Positioned at bottom edge of cover */}
        <YStack
          position="absolute"
          bottom={-AVATAR_OVERLAP} // Negative value pulls avatar up into cover
          left="$4"
          width={AVATAR_SIZE}
          height={AVATAR_SIZE}
        >
          {/* Avatar Container with thick white border */}
          <YStack
            width="100%"
            height="100%"
            borderRadius={AVATAR_SIZE / 2}
            backgroundColor="$background"
            padding="$1.5"
            elevation={1}
          >
            {/* Avatar Content */}
            {profileImageUri ? (
              <Image
                source={{ uri: profileImageUri }}
                width="100%"
                height="100%"
                borderRadius={(AVATAR_SIZE - 12) / 2} // Subtract border padding
              />
            ) : (
              <YStack
                flex={1}
                backgroundColor="$gray6"
                borderRadius={(AVATAR_SIZE - 12) / 2}
                justifyContent="center"
                alignItems="center"
              >
                <Ionicons
                  name="person"
                  size={AVATAR_SIZE * 0.4}
                  color="white"
                />
              </YStack>
            )}
          </YStack>

          {/* Profile Camera Button - Bottom right of avatar */}
          <YStack
            position="absolute"
            bottom={0}
            right={0}
            backgroundColor="$background"
            borderRadius="$10"
            elevation={1}
            borderColor="$background"
          >
            <Button
              variant="ghost"
              iconOnly
              size="sm"
              onPress={disabled ? quickActionEdit : pickProfileImage}
              leftIcon="camera"
            />
          </YStack>
        </YStack>
      </YStack>
      {disabled && (
        <QuickActionBottomSheet
          ref={quickActionBottomSheetRef}
          primaryOption="Edit"
          secondaryOption="Cancel"
          onSelectPrimary={() => setIsDisabled?.(false)}
          onSelectSecondary={() => setIsDisabled?.(true)}
          title={"Edit your profile details?"}
          subtitle={`Choose to edit or cancel the profile details`}
        />
      )}
    </YStack>
  );
}
