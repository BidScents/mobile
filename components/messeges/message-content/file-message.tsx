import { ThemedIonicons } from "@/components/ui/themed-icons";
import { FileContent } from "@bid-scents/shared-sdk";
import FastImage from "@d11/react-native-fast-image";
import { ImageZoom } from "@likashefqet/react-native-image-zoom";
import { useState } from "react";
import { Modal, Pressable, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
  const [isModalVisible, setModalVisible] = useState(false);
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  if (isImage) {
    return (
      <View maxWidth={200}>
        <Pressable onPress={() => setModalVisible(true)}>
          <FastImage
            key={`${messageId}-${content.file_url}`}
            source={{ uri: content.file_url, priority: FastImage.priority.high }}
            style={{ width: 200, height: 150, borderRadius: 16 }}
          />
        </Pressable>
        {content.caption && (
          <View paddingVertical="$1" paddingHorizontal="$2">
            <Text fontSize="$4" color="$foreground" marginTop="$2" userSelect="text">
              {content.caption}
            </Text>
          </View>
        )}
        <Modal
          visible={isModalVisible}
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
          animationType="fade"
        >
          <View flex={1} backgroundColor="$background">
            <ImageZoom
              uri={content.file_url}
              minScale={1}
              maxScale={5}
              doubleTapScale={3}
              isSingleTapEnabled
              isDoubleTapEnabled
              style={{ width: screenWidth, height: screenHeight }}
              resizeMode="contain"
            />
            <Pressable
              onPress={() => setModalVisible(false)}
              style={{
                position: "absolute",
                top: insets.top + 10,
                right: 20,
                zIndex: 1,
                backgroundColor: "rgba(0,0,0,0.5)",
                borderRadius: 20,
                padding: 5,
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <ThemedIonicons name="close" size={20} color="$foreground" />
            </Pressable>
          </View>
        </Modal>
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
