import { ThemedIonicons } from "@/components/ui/themed-icons";
import { FileContent } from "@bid-scents/shared-sdk";
import { Image, Text, View, XStack } from "tamagui";

interface FileMessageProps {
  content: FileContent;
  isCurrentUser: boolean;
  messageId: string;
}

export function FileMessage({ content, isCurrentUser, messageId }: FileMessageProps) {
  const isImage = content.file_type.startsWith("image/");

  if (isImage) {
    return (
      <View>
        <Image
          key={`${messageId}-${content.file_url}`}
          source={{ uri: content.file_url }}
          width={200}
          height={150}
          borderRadius="$5"
          resizeMode="cover"
        />
        {content.caption && (
          <Text
            fontSize="$3"
            color={isCurrentUser ? "$white" : "$color"}
            marginTop="$2"
          >
            {content.caption}
          </Text>
        )}
      </View>
    );
  }

  return (
    <View>
      <XStack
        alignItems="center"
        gap="$2"
        padding="$3"
        backgroundColor={isCurrentUser ? "rgba(255,255,255,0.1)" : "$backgroundPress"}
        borderRadius="$3"
      >
        <ThemedIonicons
          name="document-outline"
          size={24}
          color={isCurrentUser ? "$white" : "$color"}
        />
        <View flex={1}>
          <Text
            fontSize="$4"
            fontWeight="500"
            color={isCurrentUser ? "$white" : "$color"}
            numberOfLines={1}
          >
            {content.file_name}
          </Text>
          <Text
            fontSize="$2"
            color={isCurrentUser ? "rgba(255,255,255,0.8)" : "$color11"}
          >
            {content.file_type}
          </Text>
        </View>
      </XStack>
      {content.caption && (
        <Text
          fontSize="$3"
          color={isCurrentUser ? "$white" : "$color"}
          marginTop="$2"
        >
          {content.caption}
        </Text>
      )}
    </View>
  );
}