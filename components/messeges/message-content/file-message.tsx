import { ThemedIonicons } from "@/components/ui/themed-icons";
import { FileContent } from "@bid-scents/shared-sdk";
import FastImage from "@d11/react-native-fast-image";
import { Text, View, XStack } from "tamagui";

interface FileMessageProps {
  content: FileContent;
  isCurrentUser: boolean;
  messageId: string;
}

export function FileMessage({
  content,
  isCurrentUser,
  messageId,
}: FileMessageProps) {
  const isImage = content.file_type.startsWith("image/");

  if (isImage) {
    return (
      <View maxWidth={200}>
        <FastImage
          key={`${messageId}-${content.file_url}`}
          source={{ uri: content.file_url, priority: FastImage.priority.high }}
          style={{ width: 200, height: 150, borderRadius: 16 }}
        />
        {content.caption && (
          <View paddingVertical="$1" paddingHorizontal="$2">
            <Text fontSize="$4" color="$foreground" marginTop="$2" userSelect="text">
              {content.caption}
            </Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View paddingVertical="$1" paddingHorizontal="$2">
      <XStack
        alignItems="center"
        gap="$2"
        padding="$3"
        backgroundColor="$backgroundPress"
        borderRadius="$3"
      >
        <ThemedIonicons name="document-outline" size={24} color="$foreground" />
        <View flex={1}>
          <Text
            fontSize="$4"
            fontWeight="500"
            color="$foreground"
            numberOfLines={1}
            userSelect="text"
          >
            {content.file_name}
          </Text>
          <Text fontSize="$2" color="$foreground">
            {content.file_type}
          </Text>
        </View>
      </XStack>
      {content.caption && (
        <Text fontSize="$3" color="$foreground" marginTop="$2" userSelect="text">
          {content.caption}
        </Text>
      )}
    </View>
  );
}
