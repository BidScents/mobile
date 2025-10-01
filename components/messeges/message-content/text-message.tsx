import { RichTextContent } from "@bid-scents/shared-sdk";
import FastImage from "@d11/react-native-fast-image";
import { router } from "expo-router";
import { Text, View } from "tamagui";

interface TextMessageProps {
  content: RichTextContent;
  isCurrentUser: boolean;
}

export function TextMessage({ content, isCurrentUser }: TextMessageProps) {
  if (content.listing) {
    return (
      <View maxWidth={200}>
        {content.listing && (
          <View
            padding="$2"
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
        <View
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