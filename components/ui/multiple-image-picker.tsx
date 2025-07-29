import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@tamagui/core";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import React from "react";
import {
  Alert,
  Dimensions,
  Linking,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Image, Text, XStack, YStack } from "tamagui";

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
  const theme = useTheme();
  const screenWidth = Dimensions.get("window").width;
  const padding = 32;
  const gap = 12;
  const itemsPerRow = 3;
  const itemSize =
    (screenWidth - padding - gap * (itemsPerRow - 1)) / itemsPerRow;

  /**
   * Check if image file size is acceptable
   */
  const checkImageSize = async (uri: string): Promise<boolean> => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (fileInfo.exists && fileInfo.size) {
        const sizeInMB = fileInfo.size / (1024 * 1024);
        if (sizeInMB > 10) {
          Alert.alert(
            "Image Too Large",
            `This image is ${sizeInMB.toFixed(
              1
            )}MB. Please choose an image smaller than 10MB.`
          );
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error("Error checking file size:", error);
      return true; // Allow if we can't check
    }
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
   * Handle adding new images
   */
  const pickImages = async () => {
    if (disabled || imageUris.length >= maxImages) return;

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.3,
        selectionLimit: Math.max(1, maxImages - imageUris.length),
      });

      if (!result.canceled && result.assets) {
        // Check size for each selected image
        const validUris: string[] = [];

        for (const asset of result.assets) {
          const isValidSize = await checkImageSize(asset.uri);
          if (isValidSize) {
            validUris.push(asset.uri);
          }
        }

        if (validUris.length > 0) {
          onImagesChange([...imageUris, ...validUris]);
        }
      }
    } catch (error) {
      console.error("Image selection failed:", error);
      Alert.alert("Error", "Failed to select images");
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
              <Ionicons name="add" size={32} color="#999" />
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
                        backgroundColor: theme.background.get(),
                        borderRadius: 12,
                        width: 24,
                        height: 24,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                      onPress={() => removeImage(index)}
                    >
                      <Ionicons name="close" size={16} color="$foreground" />
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
                        <Ionicons name="chevron-back" size={16} color="#666" />
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
                        <Ionicons
                          name="chevron-forward"
                          size={16}
                          color="#666"
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
                  <Ionicons name="add" size={32} color="#999" />
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