import { ThemedIonicons } from "@/components/ui/themed-icons";
import { RichTextContent, useAuthStore } from "@bid-scents/shared-sdk";
import FastImage from "@d11/react-native-fast-image";
import { router } from "expo-router";
import { Text, View, XStack } from "tamagui";

interface TextMessageProps {
  content: RichTextContent;
  isCurrentUser: boolean;
  onSellThisPress?: (listing: any) => void;
}

export function TextMessage({ content, isCurrentUser, onSellThisPress }: TextMessageProps) {
  const {user} = useAuthStore();

  const isSeller = user?.id === content.listing?.seller_id;

  if (content.listing) {
    return (
      <View maxWidth={200} gap="$2">
        {content.listing && (
          <View
            position="relative"
            gap="$2"
            onPress={() => router.push(`/listing/${content.listing?.id}`)}
          >
            {/* Listing Image */}
            {content.listing.image_url && process.env.EXPO_PUBLIC_IMAGE_BASE_URL && (
              <FastImage
                source={{
                  uri: `${process.env.EXPO_PUBLIC_IMAGE_BASE_URL}${content.listing.image_url}`,
                  priority: FastImage.priority.normal,
                }}
                style={{
                  width: 200,
                  height: 150,
                  borderRadius: 8,
                }}
              />
            )}
            
            {/* Sell This Button - Only show if user is the seller */}
            {isSeller && onSellThisPress && (
              <XStack 
                alignItems="center" 
                hitSlop={20} 
                backgroundColor="$muted" 
                paddingHorizontal="$2" 
                paddingVertical="$1.5" 
                borderRadius="$5" 
                gap="$2" 
                onPress={() => onSellThisPress(content.listing)}
                position="absolute"
                right="$2"
                top="$2"
              >
                <Text fontSize="$3" fontWeight="500" color="$foreground">
                  Sell This
                </Text>
                <ThemedIonicons
                  name="navigate-circle"
                  size={18}
                  color="$mutedForeground"
                />
              </XStack>
            )}
            
            {/* Listing Info */}
            <View gap="$1">
              <Text
                fontSize="$3"
                fontWeight="600"
                color="$foreground"
                numberOfLines={1}
              >
                {content.listing.name}
              </Text>
              <Text
                fontSize="$2"
                color="$foreground"
              >
                ${content.listing.price?.toFixed(2)}
              </Text>
            </View>
          </View>
        )}
        <View>
          <Text
            fontSize="$4"
            color="$foreground"
            lineHeight="$2"
          >
            {content.text}
          </Text>
        </View>
      </View>
    );
  }
  
  return (
    <View
      paddingVertical="$1"
      paddingHorizontal="$2"
    >
      <Text
        fontSize="$4"
        color="$foreground"
        lineHeight="$2"
      >
        {content.text}
      </Text>
    </View>
  );
}