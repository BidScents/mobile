import { ThemedIonicons } from "@/components/ui/themed-icons";
import { TouchableOpacity } from "react-native";
import { Image, ScrollView, View } from "tamagui";

interface ImagePreviewProps {
  selectedImages: string[];
  isUploading: boolean;
  onRemoveImage: (index: number) => void;
}

export const ImagePreview = ({ selectedImages, isUploading, onRemoveImage }: ImagePreviewProps) => {
  const imageSize = 60;

  if (selectedImages.length === 0) return null;

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ padding: 16, gap: 8 }}
    >
      {selectedImages.map((uri, index) => (
        <View key={index} position="relative">
          <Image
            source={{ uri }}
            width={imageSize}
            height={imageSize}
            borderRadius="$3"
            opacity={isUploading ? 0.5 : 1}
          />
          {isUploading && (
            <View
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              alignItems="center"
              justifyContent="center"
              backgroundColor="rgba(0,0,0,0.3)"
              borderRadius="$3"
            >
              <ThemedIonicons name="hourglass-outline" size={20} color="white" />
            </View>
          )}
          {!isUploading && (
            <TouchableOpacity
              style={{
                position: 'absolute',
                top: -8,
                right: -8,
                backgroundColor: 'rgba(0,0,0,0.7)',
                borderRadius: 12,
                width: 24,
                height: 24,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() => onRemoveImage(index)}
            >
              <ThemedIonicons name="close" size={16} color="white" />
            </TouchableOpacity>
          )}
        </View>
      ))}
    </ScrollView>
  );
};