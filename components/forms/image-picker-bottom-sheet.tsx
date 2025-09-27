import { BottomSheet } from "@/components/ui/bottom-sheet";
import { ThemedIonicons } from "@/components/ui/themed-icons";
import { useImagePicker } from "@/hooks/use-image-picker";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import * as Haptics from "expo-haptics";
import React, { forwardRef, useImperativeHandle } from "react";
import { Text, View, XStack, YStack } from "tamagui";
import { Button } from "../ui/button";

export interface ImagePickerBottomSheetMethods {
  present: () => void;
  dismiss: () => void;
}

interface ImagePickerBottomSheetProps {
  onImagesSelected: (uris: string[]) => void;
  title?: string;
  subtitle?: string;
  allowMultiple?: boolean;
  maxImages?: number;
}

export const ImagePickerBottomSheet = forwardRef<
  ImagePickerBottomSheetMethods,
  ImagePickerBottomSheetProps
>(
  (
    {
      onImagesSelected,
      title = "Add Photos",
      subtitle = "Choose how you'd like to add photos",
      allowMultiple = true,
      maxImages = 10,
    },
    ref
  ) => {
    const colors = useThemeColors();
    const bottomSheetRef = React.useRef<BottomSheetModalMethods>(null);

    const { pickFromGallery, takePhoto } = useImagePicker({
      allowMultiple,
      maxImages,
      quality: 0.2,
      maxSizeInMB: 10,
    });

    useImperativeHandle(ref, () => ({
      present: () => bottomSheetRef.current?.present(),
      dismiss: () => bottomSheetRef.current?.dismiss(),
    }));

    const handleGalleryPress = async () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const results = await pickFromGallery();
      if (results.length > 0) {
        onImagesSelected(results.map((r) => r.uri));
        bottomSheetRef.current?.dismiss();
      }
    };

    const handleCameraPress = async () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const result = await takePhoto();
      if (result) {
        onImagesSelected([result.uri]);
        bottomSheetRef.current?.dismiss();
      }
    };

    return (
      <BottomSheet ref={bottomSheetRef}>
        <YStack gap="$5" padding="$4" paddingBottom="$5">
          {/* Header */}
          <YStack gap="$2">
            <Text
              textAlign="left"
              fontSize="$7"
              fontWeight="600"
              color="$foreground"
            >
              {title}
            </Text>
            <Text
              textAlign="left"
              color="$mutedForeground"
              fontSize="$4"
              lineHeight="$5"
            >
              {subtitle}
            </Text>
          </YStack>

          {/* Options */}
          <YStack gap="$3" flex={1}>
            {/* Camera Option */}
            <XStack
              alignItems="center"
              gap="$3"
              borderRadius="$6"
              backgroundColor="$muted"
              paddingVertical="$3"
              paddingHorizontal="$4"
              onPress={handleCameraPress}
              pressStyle={{ opacity: 0.7, scale: 0.98 }}
            >
              <View
                backgroundColor="$foreground"
                borderRadius="$12"
                padding="$2"
              >
                <ThemedIonicons
                  name="camera"
                  size={20}
                  themeColor="foreground"
                  style={{ color: colors.background }}
                />
              </View>
              <YStack flex={1}>
                <Text fontSize="$5" fontWeight="600" color="$foreground">
                  Take Photo
                </Text>
                <Text fontSize="$3" color="$mutedForeground">
                  Use camera to take a new photo
                </Text>
              </YStack>
              <ThemedIonicons
                name="chevron-forward"
                size={20}
                themeColor="muted"
              />
            </XStack>

            {/* Gallery Option */}
            <XStack
              alignItems="center"
              gap="$3"
              borderRadius="$6"
              backgroundColor="$muted"
              paddingVertical="$3"
              paddingHorizontal="$4"
              onPress={handleGalleryPress}
              pressStyle={{ opacity: 0.7, scale: 0.98 }}
            >
              <View
                backgroundColor="$foreground"
                borderRadius="$12"
                padding="$2"
              >
                <ThemedIonicons
                  name="images"
                  size={20}
                  themeColor="foreground"
                  style={{ color: colors.background }}
                />
              </View>
              <YStack flex={1}>
                <Text fontSize="$5" fontWeight="600" color="$foreground">
                  Choose from Gallery
                </Text>
                <Text fontSize="$3" color="$mutedForeground">
                  {allowMultiple
                    ? `Select up to ${maxImages} photos`
                    : "Select a photo from your gallery"}
                </Text>
              </YStack>
              <ThemedIonicons
                name="chevron-forward"
                size={20}
                themeColor="muted"
              />
            </XStack>
          </YStack>
          <Button
            onPress={() => bottomSheetRef.current?.dismiss()}
            variant="primary"
            size="lg"
            borderRadius="$10"
          >
            Cancel
          </Button>
        </YStack>
      </BottomSheet>
    );
  }
);

ImagePickerBottomSheet.displayName = "ImagePickerBottomSheet";
