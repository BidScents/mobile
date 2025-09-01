import { RichTextContent } from "@bid-scents/shared-sdk";
import { Text, View } from "tamagui";

interface TextMessageProps {
  content: RichTextContent;
  isCurrentUser: boolean;
}

export function TextMessage({ content, isCurrentUser }: TextMessageProps) {
  return (
    <View>
      <Text
        fontSize="$4"
        color={isCurrentUser ? "$background" : "$color"}
        lineHeight="$2"
      >
        {content.text}
      </Text>
      {content.listing && (
        <View
          marginTop="$2"
          padding="$2"
          backgroundColor={isCurrentUser ? "$muted" : "$backgroundPress"}
          borderRadius="$2"
        >
          <Text
            fontSize="$3"
            fontWeight="600"
            color={isCurrentUser ? "$foreground" : "$color"}
            numberOfLines={1}
          >
            {content.listing.name}
          </Text>
          <Text
            fontSize="$2"
            color={isCurrentUser ? "$foreground" : "$color11"}
            numberOfLines={2}
          >
            ${content.listing.price?.toFixed(2)}
          </Text>
        </View>
      )}
    </View>
  );
}