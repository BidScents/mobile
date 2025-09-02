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
          <View
            paddingVertical="$1"
            paddingHorizontal="$2"
          >
          <Text
            fontSize="$4"
            color="$foreground"
            marginTop="$2"
          >
            {content.caption}
          </Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View
      paddingVertical="$1"
      paddingHorizontal="$2"
    >
      <XStack
        alignItems="center"
        gap="$2"
        padding="$3"
        backgroundColor="$backgroundPress"
        borderRadius="$3"
      >
        <ThemedIonicons
          name="document-outline"
          size={24}
          color="$foreground"
        />
        <View flex={1}>
          <Text
            fontSize="$4"
            fontWeight="500"
            color="$foreground"
            numberOfLines={1}
          >
            {content.file_name}
          </Text>
          <Text
            fontSize="$2"
            color="$foreground"
          >
            {content.file_type}
          </Text>
        </View>
      </XStack>
      {content.caption && (
        <Text
          fontSize="$3"
          color="$foreground"
          marginTop="$2"
        >
          {content.caption}
        </Text>
      )}
    </View>
  );
}