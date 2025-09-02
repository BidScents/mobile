import { useSendMessage } from "@/hooks/queries/use-messages";
import { ImageUploadConfigs, uploadMultipleImages } from "@/utils/image-upload-service";
import { MessageType } from "@bid-scents/shared-sdk";
import * as Haptics from 'expo-haptics';
import { useMessagingContext } from "providers/messaging-provider";
import { useRef, useState } from "react";
import { Alert, Keyboard, TouchableOpacity } from "react-native";
import { Image, Input, ScrollView, View, XStack, YStack } from "tamagui";
import { ImagePickerBottomSheet, ImagePickerBottomSheetMethods } from "../forms/image-picker-bottom-sheet";
import { ThemedIonicons } from "../ui/themed-icons";

interface ChatInputBarProps {
  id: string;
}

export const ChatInputBar = ({ id }: ChatInputBarProps) => {
  const [messageText, setMessageText] = useState("");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const sendMessageMutation = useSendMessage();
  const { typing } = useMessagingContext();
  const imagePickerRef = useRef<ImagePickerBottomSheetMethods>(null);

  const handleTextChange = (text: string) => {
    typing.onTextChange(id, text);
    setMessageText(text);
  };

  const sendTextMessage = () => {
    if (!messageText.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    console.log("text message sending");
    sendMessageMutation.mutate({
      conversationId: id,
      messageRequest: {
        content_type: MessageType.TEXT,
        content: { text: messageText.trim() }
      },
    });
    setMessageText("");
  };

  const sendImageMessage = async () => {
    if (selectedImages.length === 0) return;
    if (isUploading) return; // Prevent double uploads
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsUploading(true);

    try {
      console.log("Uploading images to Supabase...");
      
      // Upload all images to Supabase
      const uploadResults = await uploadMultipleImages(
        selectedImages,
        ImageUploadConfigs.message()
      );

      console.log("Images uploaded successfully, sending messages...");
      
      // Send each image as a separate message with Supabase URL
      // Since we're not using optimistic updates, messages will appear after server response
      const messagePromises = uploadResults.map((result, i) => {
        const fileName = `messageFile_${Date.now()}_${i + 1}.jpg`;
        
        console.log("Sending image message:", { url: result.url, fileName });
        
        return sendMessageMutation.mutateAsync({
          conversationId: id,
          messageRequest: {
            content_type: MessageType.FILE,
            content: {
              file_url: result.path,
              file_name: fileName,
              file_type: "image/jpeg",
              caption: messageText.trim() || undefined
            }
          },
        });
      });

      // Wait for all messages to be sent
      await Promise.all(messagePromises);
      
      // Clear state after successful upload and send
      setSelectedImages([]);
      setMessageText("");
      
    } catch (error: any) {
      console.error("Failed to upload images:", error);
      
      // Only show alert if not user cancelled
      if (error.message !== 'USER_CANCELLED') {
        Alert.alert(
          "Upload Failed",
          "Failed to upload images. Please try again.",
          [{ text: "OK" }]
        );
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleImagesSelected = (uris: string[]) => {
    setSelectedImages(prev => [...prev, ...uris]);
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const openImagePicker = () => {
    Keyboard.dismiss();
    imagePickerRef.current?.present();
  };
  
  const hasContent = messageText.trim() || selectedImages.length > 0;
  const imageSize = 60;

  return (
    <YStack>
      {/* Image Preview */}
      {selectedImages.length > 0 && (
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
                  onPress={() => removeImage(index)}
                >
                  <ThemedIonicons name="close" size={16} color="white" />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </ScrollView>
      )}

      {/* Input Bar */}
      <XStack alignItems="center" gap="$3" pb="$3" pt="$2" px="$3">
        <XStack bg="$muted" borderRadius="$6" alignItems="center" gap="$3" flex={1} pr="$3">
          <Input
            placeholder={selectedImages.length > 0 ? "Add a caption..." : "Type your message"}
            value={messageText}
            onFocus={() => typing.startTyping(id)}
            onBlur={() => typing.stopTyping(id)}
            onChangeText={(text) => handleTextChange(text)}
            onSubmitEditing={selectedImages.length > 0 ? sendImageMessage : sendTextMessage}
            flex={1}
            borderRadius="$6"
            height="$4"
            fontSize="$5"
            borderWidth={0}
            backgroundColor="$muted"
            color="$foreground"
            px="$3"
          />
          <ThemedIonicons name="cash-outline" size={24} color="$mutedForeground" />
          <TouchableOpacity onPress={openImagePicker}>
            <ThemedIonicons name="camera-outline" size={24} color="$mutedForeground" />
          </TouchableOpacity>
        </XStack>
        {hasContent && (
          <TouchableOpacity 
            onPress={selectedImages.length > 0 ? sendImageMessage : sendTextMessage}
            style={{ 
              opacity: (sendMessageMutation.isPending || isUploading) ? 0.6 : 1,
              transform: [{ scale: 0.93 }]
            }}
            disabled={sendMessageMutation.isPending || isUploading}
          >
            <ThemedIonicons 
              name={(sendMessageMutation.isPending || isUploading) ? "hourglass-outline" : "send"} 
              size={28} 
            />
          </TouchableOpacity>
        )}
      </XStack>

      {/* Image Picker Bottom Sheet */}
      <ImagePickerBottomSheet
        ref={imagePickerRef}
        onImagesSelected={handleImagesSelected}
        allowMultiple={true}
        maxImages={10}
        title="Add Photos"
        subtitle="Choose photos for your message"
      />
    </YStack>
  );
};
