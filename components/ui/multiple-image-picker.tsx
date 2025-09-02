import { ThemedIonicons } from "./themed-icons";
import { useImagePicker } from "@/hooks/use-image-picker";
import React from "react";
import {
  Dimensions,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Image, Text, XStack, YStack } from "tamagui";
import { useThemeColors } from '../../hooks/use-theme-colors';

interface MultipleImagePickerProps {
  imageUris: string[];
  onImagesChange: (uris: string[]) => void;
  disabled?: boolean;
  maxImages?: number;
  label?: string;
}

export function MultipleImagePicker({
  imageUris,
  onImagesChange,
  disabled = false,
  maxImages = 10,
  label = "Photos",
}: MultipleImagePickerProps) {
  const colors = useThemeColors();
  const screenWidth = Dimensions.get("window").width;
  const padding = 32;
  const gap = 12;
  const itemsPerRow = 3;
  const itemSize =
    (screenWidth - padding - gap * (itemsPerRow - 1)) / itemsPerRow;
  
  const { pickFromGallery } = useImagePicker({
    allowMultiple: true,
    maxImages,
    allowsEditing: false,
    quality: 0.3
  });



  /**
   * Handle adding new images using universal hook
   */
  const pickImages = async () => {
    if (disabled || imageUris.length >= maxImages) return;

    const selectedImages = await pickFromGallery();
    
    if (selectedImages.length > 0) {
      // Limit to remaining slots
      const remainingSlots = maxImages - imageUris.length;
      const imagesToAdd = selectedImages.slice(0, remainingSlots);
      const newUris = imagesToAdd.map(img => img.uri);
      
      onImagesChange([...imageUris, ...newUris]);
    }
  };

  /**
   * Remove image at specific index
   */
  const removeImage = (index: number) => {
    const newUris = imageUris.filter((_, i) => i !== index);
    onImagesChange(newUris);
  };

  /**
   * Move image to new position
   */
  const moveImage = (fromIndex: number, direction: "left" | "right") => {
    const newUris = [...imageUris];
    const toIndex = direction === "left" ? fromIndex - 1 : fromIndex + 1;

    if (toIndex < 0 || toIndex >= newUris.length) return;

    [newUris[fromIndex], newUris[toIndex]] = [
      newUris[toIndex],
      newUris[fromIndex],
    ];
    onImagesChange(newUris);
  };

  const canAddMore = imageUris.length < maxImages;

  return (
    <YStack gap="$3">
      {label && (
        <Text color="$mutedForeground" fontSize="$4" fontWeight="500">
          {label} ({imageUris.length}/{maxImages})
        </Text>
      )}

      <YStack gap="$3">
        {/* Show full-width add button when no images */}
        {imageUris.length === 0 && canAddMore && (
          <TouchableOpacity onPress={pickImages} disabled={disabled}>
            <YStack
              width="100%"
              height={itemSize}
              borderWidth={2}
              borderStyle="dashed"
              borderColor="$mutedForeground"
              borderRadius="$6"
              justifyContent="center"
              alignItems="center"
              backgroundColor="$background"
              opacity={disabled ? 0.5 : 1}
            >
              <ThemedIonicons name="add" size={32} color={colors.foreground} />
              <Text
                color="$mutedForeground"
                fontSize="$2"
                textAlign="center"
                marginTop="$1"
              >
                Add Photo
              </Text>
            </YStack>
          </TouchableOpacity>
        )}

        {/* Show horizontal scroll with images when images exist */}
        {imageUris.length > 0 && (
          <ScrollView
            showsHorizontalScrollIndicator={false}
            style={{ flex: 1 }}
            horizontal
            contentContainerStyle={{ gap: gap }}
          >
            {imageUris.map((uri, index) => {
              return (
                <YStack key={index} gap="$2">
                  <YStack
                    position="relative"
                    width={itemSize}
                    height={itemSize}
                    borderRadius="$4"
                    overflow="hidden"
                    backgroundColor="$background"
                    borderWidth={1}
                    borderColor="$borderColor"
                  >
                    <Image source={{ uri }} width="100%" height="100%" />

                    <YStack
                      position="absolute"
                      top="$2"
                      left="$2"
                      backgroundColor="rgba(0,0,0,0.7)"
                      borderRadius="$10"
                      width={24}
                      height={24}
                      justifyContent="center"
                      alignItems="center"
                    >
                      <Text color="white" fontSize="$2" fontWeight="600">
                        {index + 1}
                      </Text>
                    </YStack>

                    <TouchableOpacity
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        backgroundColor: colors.background,
                        borderRadius: 12,
                        width: 24,
                        height: 24,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                      onPress={() => removeImage(index)}
                    >
                      <ThemedIonicons name="close" size={16} color={colors.foreground} />
                    </TouchableOpacity>
                  </YStack>

                  <XStack justifyContent="center" gap="$2">
                    <TouchableOpacity
                      onPress={() => moveImage(index, "left")}
                      disabled={index === 0}
                      style={{ opacity: index === 0 ? 0.3 : 1 }}
                    >
                      <YStack
                        backgroundColor="$background"
                        borderWidth={1}
                        borderColor="$borderColor"
                        borderRadius="$2"
                        padding="$1"
                      >
                        <ThemedIonicons name="chevron-back" size={20} color={colors.foreground} />
                      </YStack>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => moveImage(index, "right")}
                      disabled={index === imageUris.length - 1}
                      style={{
                        opacity: index === imageUris.length - 1 ? 0.3 : 1,
                      }}
                    >
                      <YStack
                        backgroundColor="$background"
                        borderWidth={1}
                        borderColor="$borderColor"
                        borderRadius="$2"
                        padding="$1"
                      >
                        <ThemedIonicons
                          name="chevron-forward"
                          size={20}
                          color={colors.foreground}
                        />
                      </YStack>
                    </TouchableOpacity>
                  </XStack>
                </YStack>
              );
            })}

            {/* Add button in horizontal scroll when images exist */}
            {canAddMore && (
              <TouchableOpacity onPress={pickImages} disabled={disabled}>
                <YStack
                  width={itemSize}
                  height={itemSize}
                  borderWidth={2}
                  borderStyle="dashed"
                  borderColor="$mutedForeground"
                  borderRadius="$4"
                  justifyContent="center"
                  alignItems="center"
                  backgroundColor="$background"
                  opacity={disabled ? 0.5 : 1}
                  gap="$1"
                >
                  <ThemedIonicons name="add" size={32} color="#999" />
                  <Text
                    color="$mutedForeground"
                    fontSize="$2"
                    textAlign="center"
                  >
                    Add Photo
                  </Text>
                </YStack>
              </TouchableOpacity>
            )}
          </ScrollView>
        )}
      </YStack>
    </YStack>
  );
}