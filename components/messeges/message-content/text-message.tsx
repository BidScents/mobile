import { RichTextContent } from "@bid-scents/shared-sdk";
import { Text, View } from "tamagui";

interface TextMessageProps {
  content: RichTextContent;
  isCurrentUser: boolean;
}

export function TextMessage({ content, isCurrentUser }: TextMessageProps) {
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
      {content.listing && (
        <View
          marginTop="$2"
          padding="$2"
          backgroundColor="$backgroundPress"
          borderRadius="$2"
        >
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
            numberOfLines={2}
          >
            ${content.listing.price?.toFixed(2)}
          </Text>
        </View>
      )}
    </View>
  );
}