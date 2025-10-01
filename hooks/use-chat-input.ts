import { useSendMessage } from "@/hooks/queries/use-messages";
import { ImageUploadConfigs, uploadMultipleImages } from "@/utils/image-upload-service";
import { MessageType } from "@bid-scents/shared-sdk";
import * as Haptics from 'expo-haptics';
import { useMessagingContext } from "providers/messaging-provider";
import { useState } from "react";
import { Alert } from "react-native";

interface UseChatInputProps {
  conversationId: string;
  referenceListingId?: string;
}

export const useChatInput = ({ conversationId, referenceListingId }: UseChatInputProps) => {
  const [messageText, setMessageText] = useState(referenceListingId ? "I am interested in this listing" : "");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [currentReferenceListingId, setCurrentReferenceListingId] = useState<string | undefined>(referenceListingId);
  
  const sendMessageMutation = useSendMessage();
  const { typing } = useMessagingContext();

  const handleTextChange = (text: string) => {
    typing.onTextChange(conversationId, text);
    setMessageText(text);
  };

  const sendTextMessage = () => {
    if (!messageText.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    console.log("text message sending");
    sendMessageMutation.mutate({
      conversationId,
      messageRequest: {
        content_type: MessageType.TEXT,
        content: { 
          text: messageText.trim(),
          listing_id: currentReferenceListingId || null
        }
      },
    });
    setMessageText("");
    // Clear reference listing after sending
    setCurrentReferenceListingId(undefined);
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
      const messagePromises = uploadResults.map((result, i) => {
        const fileName = `messageFile_${Date.now()}_${i + 1}.jpg`;
        
        console.log("Sending image message:", { url: result.url, fileName });
        
        return sendMessageMutation.mutateAsync({
          conversationId,
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

  const clearReferenceListing = () => {
    setCurrentReferenceListingId(undefined);
  };

  const hasContent = messageText.trim().length > 0 || selectedImages.length > 0;
  const isLoading = sendMessageMutation.isPending || isUploading;

  return {
    messageText,
    selectedImages,
    isUploading,
    isLoading,
    hasContent,
    currentReferenceListingId,
    handleTextChange,
    sendTextMessage,
    sendImageMessage,
    handleImagesSelected,
    removeImage,
    clearReferenceListing,
    typing,
  };
};