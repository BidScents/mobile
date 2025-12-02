import { Button } from "@/components/ui/button";
import { ThemedIonicons } from "@/components/ui/themed-icons";
import { useImagePicker } from "@/hooks/use-image-picker";
import { Image } from "expo-image";
import React from "react";
import { Alert, TouchableOpacity } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import Carousel, {
  ICarouselInstance,
  Pagination,
} from "react-native-reanimated-carousel";
import { Text, View, XStack, YStack } from "tamagui";
import { useThemeColors } from '../../hooks/use-theme-colors';

export interface EditableImageItem {
  uri: string;
  isNew: boolean; // true for newly added images, false for existing ones
  originalUrl?: string; // for existing images, store the original URL
}

interface EditableImageCarouselProps {
  images: EditableImageItem[];
  onImagesChange: (images: EditableImageItem[]) => void;
  width: number;
  height: number;
  disabled?: boolean;
  maxImages?: number;
}

export function EditableImageCarousel({
  images,
  onImagesChange,
  width,
  height,
  disabled = false,
  maxImages = 10,
}: EditableImageCarouselProps) {
  const colors = useThemeColors();
  const ref = React.useRef<ICarouselInstance>(null);
  const progress = useSharedValue<number>(0);
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const { pickFromGallery, takePhoto } = useImagePicker({
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.4,
    allowMultiple: true,
    maxImages: maxImages - images.length, // Limit based on current images
  });

  const onPressPagination = (index: number) => {
    ref.current?.scrollTo({
      count: index - progress.value,
      animated: true,
    });
  };

  const handleDeleteImage = (index: number) => {
    Alert.alert(
      "Delete Image",
      "Are you sure you want to delete this image?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            const newImages = images.filter((_, i) => i !== index);
            onImagesChange(newImages);
            
            // Adjust current index if needed
            if (currentIndex >= newImages.length && newImages.length > 0) {
              setCurrentIndex(newImages.length - 1);
              ref.current?.scrollTo({
                count: newImages.length - 1 - progress.value,
                animated: true,
              });
            }
          },
        },
      ]
    );
  };

  const handleMoveImage = (index: number, direction: 'left' | 'right') => {
    const newImages = [...images];
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= images.length) return;
    
    // Swap the images
    [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];
    onImagesChange(newImages);
    
    // Update carousel to show the moved image
    setCurrentIndex(targetIndex);
    ref.current?.scrollTo({
      count: targetIndex - progress.value,
      animated: true,
    });
  };

  const handleAddImage = () => {
    if (images.length >= maxImages) {
      Alert.alert("Maximum Images", `You can only add up to ${maxImages} images.`);
      return;
    }

    Alert.alert(
      "Add Image",
      "Choose how you want to add an image",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Camera",
          onPress: async () => {
            const result = await takePhoto();
            if (result) {
              const newImage: EditableImageItem = {
                uri: result.uri,
                isNew: true,
              };
              onImagesChange([...images, newImage]);
            }
          },
        },
        {
          text: "Gallery",
          onPress: async () => {
            const results = await pickFromGallery();
            if (results.length > 0) {
              const newImages: EditableImageItem[] = results.map(result => ({
                uri: result.uri,
                isNew: true,
              }));
              onImagesChange([...images, ...newImages]);
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item, index }: { item: EditableImageItem; index: number }) => (
    <View style={{ position: 'relative' }}>
      <Image
        source={{
          uri: item.isNew 
            ? item.uri 
            : `${process.env.EXPO_PUBLIC_IMAGE_BASE_URL}${item.originalUrl || item.uri}`,
        }}
        style={{ width, height, borderRadius: 8 }}
      />
      
      {/* Delete button */}
      {!disabled && (
        <TouchableOpacity
          onPress={() => handleDeleteImage(index)}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            borderRadius: 16,
            width: 32,
            height: 32,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ThemedIonicons name="close" size={18} color="white" />
        </TouchableOpacity>
      )}
      
      {/* Arrow buttons */}
      {!disabled && images.length > 1 && (
        <XStack
          position="absolute"
          bottom={8}
          left={8}
          right={8}
          justifyContent="space-between"
        >
          {/* Left arrow */}
          {index > 0 && (
            <TouchableOpacity
              onPress={() => handleMoveImage(index, 'left')}
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                borderRadius: 16,
                width: 32,
                height: 32,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <ThemedIonicons name="chevron-back" size={18} color="white" />
            </TouchableOpacity>
          )}
          
          {/* Right arrow */}
          {index < images.length - 1 && (
            <TouchableOpacity
              onPress={() => handleMoveImage(index, 'right')}
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                borderRadius: 16,
                width: 32,
                height: 32,
                justifyContent: 'center',
                alignItems: 'center',
                marginLeft: 'auto',
              }}
            >
              <ThemedIonicons name="chevron-forward" size={18} color="white" />
            </TouchableOpacity>
          )}
        </XStack>
      )}
    </View>
  );

  if (images.length === 0) {
    return (
      <YStack alignItems="center" justifyContent="center" height={height} gap="$3">
        <ThemedIonicons name="images-outline" size={48} color="$mutedForeground" />
        <Button
          variant="secondary"
          size="md"
          onPress={handleAddImage}
          disabled={disabled}
        >
          <Text>Add Images</Text>
        </Button>
      </YStack>
    );
  }

  return (
    <YStack gap="$3">
      <View style={{ position: 'relative' }}>
        <Carousel
          ref={ref}
          width={width}
          height={height}
          data={images}
          onProgressChange={progress}
          onSnapToItem={setCurrentIndex}
          renderItem={renderItem}
          style={{ borderRadius: 8 }}
        />

        {/* Pagination */}
        {images.length > 1 && (
          <Pagination.Basic
            progress={progress}
            data={images}
            dotStyle={{
              backgroundColor: colors.mutedForeground,
              borderRadius: 5,
            }}
            activeDotStyle={{
              backgroundColor: colors.background,
              overflow: "hidden",
              borderRadius: 5,
            }}
            containerStyle={{
              gap: 5,
              marginTop: 10,
              position: "absolute",
              bottom: 20,
              left: 0,
              right: 0,
              justifyContent: 'center',
            }}
            onPress={onPressPagination}
          />
        )}
      </View>

      {/* Add more images button */}
      {!disabled && images.length < maxImages && (
        <Button
          variant="secondary"
          size="sm"
          onPress={handleAddImage}
        >
          <XStack alignItems="center" gap="$2">
            <ThemedIonicons name="add" size={20} />
            <Text fontWeight="$3">Add More Images ({images.length}/{maxImages})</Text>
          </XStack>
        </Button>
      )}
    </YStack>
  );
}