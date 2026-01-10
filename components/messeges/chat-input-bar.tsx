import { useListingDetail } from "@/hooks/queries/use-listing";
import { useChatInput } from "@/hooks/use-chat-input";
import { useTransactionActions } from "@/hooks/use-transaction-actions";
import * as Haptics from 'expo-haptics';
import { useRef } from "react";
import { Keyboard } from "react-native";
import { Input, XStack, YStack } from "tamagui";
import { ImagePickerBottomSheet, ImagePickerBottomSheetMethods } from "../forms/image-picker-bottom-sheet";
import { TransactionBottomSheet } from "../forms/transaction-bottom-sheet";
import { ImagePreview } from "./chat-input-bar/image-preview";
import { InputActions } from "./chat-input-bar/input-actions";
import { ListingPreview } from "./chat-input-bar/listing-preview";
import { SendButton } from "./chat-input-bar/send-button";

interface ChatInputBarProps {
  id: string;
  referenceListingId?: string;
}

export const ChatInputBar = ({ id, referenceListingId }: ChatInputBarProps) => {
  const imagePickerRef = useRef<ImagePickerBottomSheetMethods>(null);
  
  // Fetch listing details if referenceListingId is provided
  const { data: listingData } = useListingDetail(referenceListingId || '');

  const {
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
  } = useChatInput({ conversationId: id, referenceListingId });

  const {
    showTransactionButton,
    buyerId,
    transactionBottomSheetRef,
    openTransactionBottomSheet,
    handleTransactionCreated,
  } = useTransactionActions({ conversationId: id });

  const openImagePicker = () => {
    Keyboard.dismiss();
    imagePickerRef.current?.present();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <YStack>
      {/* Listing Preview */}
      {currentReferenceListingId && listingData?.listing && (
        <ListingPreview
          listing={{
            id: listingData.listing.id,
            seller_id: listingData.seller.id,
            name: listingData.listing.name,
            price: listingData.listing.price,
            image_url: listingData.image_urls[0] || null,
          }}
          onDismiss={clearReferenceListing}
        />
      )}

      <ImagePreview 
        selectedImages={selectedImages}
        isUploading={isUploading}
        onRemoveImage={removeImage}
      />

      {/* Input Bar */}
      <XStack alignItems="center" gap="$3" pb="$3" pt="$2" px="$3">
        <XStack bg="$muted" borderRadius="$6" alignItems="center" gap="$3" flex={1} pr="$3">
          <Input
            placeholder={selectedImages.length > 0 ? "Add a caption..." : "Type your message"}
            value={messageText}
            onFocus={() => typing.startTyping(id)}
            onBlur={() => typing.stopTyping(id)}
            onChangeText={handleTextChange}
            onSubmitEditing={selectedImages.length > 0 ? sendImageMessage : sendTextMessage}
            flex={1}
            borderRadius="$6"
            minHeight={45}
            maxHeight={150}
            multiline
            fontSize="$5"
            borderWidth={0}
            backgroundColor="$muted"
            color="$foreground"
            px="$3"
          />
          <InputActions 
            showTransactionButton={showTransactionButton}
            onTransactionPress={openTransactionBottomSheet}
            onImagePickerPress={openImagePicker}
          />
        </XStack>
        
        <SendButton 
          hasContent={hasContent}
          isLoading={isLoading}
          onPress={selectedImages.length > 0 ? sendImageMessage : sendTextMessage}
        />
      </XStack>

      {/* Bottom Sheets */}
      <ImagePickerBottomSheet
        ref={imagePickerRef}
        onImagesSelected={handleImagesSelected}
        allowMultiple={true}
        maxImages={10}
        title="Add Photos"
        subtitle="Choose photos for your message"
      />

      {showTransactionButton && (
        <TransactionBottomSheet
          ref={transactionBottomSheetRef}
          conversationId={id}
          buyerId={buyerId}
          onTransactionCreated={handleTransactionCreated}
        />
      )}
    </YStack>
  );
};
