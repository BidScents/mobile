import { ThemedIonicons } from "@/components/ui/themed-icons";
import { ListingPreview as ListingPreviewType } from "@bid-scents/shared-sdk";
import FastImage from "@d11/react-native-fast-image";
import { TouchableOpacity } from "react-native";
import { Text, View, XStack } from "tamagui";

interface ListingPreviewProps {
  listing: ListingPreviewType;
  onDismiss: () => void;
}

export const ListingPreview = ({ listing, onDismiss }: ListingPreviewProps) => {
  const imageSize = 60;

  return (
    <View
      paddingHorizontal="$4"
      paddingVertical="$2"
    >
      <XStack alignItems="center" borderRadius="$6" gap="$3" paddingHorizontal="$3" paddingVertical="$2" backgroundColor="$muted">
        {/* Listing Image */}
        <View position="relative">
          {listing.image_url && process.env.EXPO_PUBLIC_IMAGE_BASE_URL ? (
            <FastImage
              source={{
                uri: `${process.env.EXPO_PUBLIC_IMAGE_BASE_URL}${listing.image_url}`,
                priority: FastImage.priority.normal,
              }}
              style={{
                width: imageSize,
                height: imageSize,
                borderRadius: 8,
              }}
            />
          ) : (
            <View
              width={imageSize}
              height={imageSize}
              borderRadius="$3"
              backgroundColor="$gray6"
              justifyContent="center"
              alignItems="center"
            >
              <ThemedIonicons name="image-outline" size={24} color="$mutedForeground" />
            </View>
          )}
        </View>

        {/* Listing Info */}
        <View flex={1} gap="$1">
          <Text
            fontSize="$4"
            fontWeight="500"
            color="$foreground"
            numberOfLines={1}
          >
            {listing.name}
          </Text>
          <Text
            fontSize="$3"
            color="$mutedForeground"
          >
            ${listing.price?.toFixed(2)}
          </Text>
        </View>

        {/* Dismiss Button */}
        <TouchableOpacity
          onPress={onDismiss}
          style={{
            padding: 8,
          }}
          hitSlop={20}
        >
          <ThemedIonicons name="close" size={20} color="$mutedForeground" />
        </TouchableOpacity>
      </XStack>
    </View>
  );
};