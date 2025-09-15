import { Button } from "@/components/ui/button";
import { ThemedIonicons } from "@/components/ui/themed-icons";
import { useSubmitReview } from "@/hooks/queries/use-payments";
import {
  MessageResData,
  RichSubmitReviewActionContent
} from "@bid-scents/shared-sdk";
import { useState } from "react";
import { Pressable } from "react-native";
import { Text, TextArea, XStack, YStack } from "tamagui";

interface SystemReviewMessageProps {
  content: RichSubmitReviewActionContent;
  isBuyer: boolean;
  isSeller: boolean;
  messageId: string;
  message: MessageResData;
}

export function SystemReviewMessage({ content, isBuyer, isSeller, messageId, message }: SystemReviewMessageProps) {
  const submitReview = useSubmitReview();
  const [rating, setRating] = useState<number>(4);
  const [comment, setComment] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState(!content.is_active);

  // Only show for buyers
  if (!isBuyer && isSeller) {
    return (
      <YStack
        backgroundColor="$muted"
        borderRadius="$6"
        paddingBottom="$3"
        paddingTop="$4"
        paddingHorizontal="$4"
        width="100%"
        gap="$3"
        marginVertical="$5"
      >
          <Text
            fontSize="$4"
            fontWeight="500"
            color="$foreground"
            flex={1}
            minWidth="200"
          >
            {content.is_active ? "Waiting for buyer to submit review" : "Buyer has submitted review"}
          </Text>
  
          <XStack
            position="absolute"
            top={-8}
            left={8}
            backgroundColor="$foreground"
            paddingHorizontal="$2"
            paddingVertical="$1"
            borderRadius="$6"
            zIndex={1}
          >
            <Text fontSize="$2" color="$background" fontWeight="600">
              {content.is_active ? "Waiting for Review" : "Review Submitted"}
            </Text>
          </XStack>
      </YStack>
    );
  }

  const handleStarPress = (starIndex: number) => {
    if (submitReview.isPending || isSubmitted) return;
    
    // If clicking the same star that's already selected, unselect it
    if (rating === starIndex) {
      setRating(0);
    } else {
      setRating(starIndex);
    }
  };

  const handleSubmitReview = async () => {
    if (!content.is_active || rating === 0 || submitReview.isPending) return;
    
    const updatedMessage: MessageResData = {
      ...message,
      content: {
        ...content,
        is_active: false
      }
    };
    
    try {
      await submitReview.mutateAsync({ 
        messageId, 
        reviewRequest: { 
          rating, 
          comment: comment.trim() || undefined 
        },
        updatedMessage
      });
      setIsSubmitted(true);
    } catch (error) {
      console.error("Failed to submit review:", error);
    }
  };

  const renderStars = () => {
    return (
      <XStack gap="$2" alignItems="center" justifyContent="center">
        {[1, 2, 3, 4, 5].map((starIndex) => (
          <Pressable
            key={starIndex}
            onPress={() => handleStarPress(starIndex)}
            disabled={submitReview.isPending || isSubmitted}
            style={{
              opacity: (submitReview.isPending || isSubmitted) ? 0.5 : 1,
            }}
          >
            <ThemedIonicons
              name={rating >= starIndex ? "star" : "star-outline"}
              size={28}
              color={rating >= starIndex ? "#FFD700" : "$mutedForeground"}
            />
          </Pressable>
        ))}
      </XStack>
    );
  };

  return (
    <YStack
      backgroundColor="$muted"
      borderRadius="$6"
      paddingBottom="$3"
      paddingTop="$4"
      paddingHorizontal="$4"
      width="100%"
      marginVertical="$5"
      gap="$3"
    >
      {isSubmitted ? (
        <Text
          fontSize="$4"
          fontWeight="500"
          color="$foreground"
          textAlign="center"
        >
          Review submitted, thank you!
        </Text>
      ) : (
        <>

          {renderStars()}

          <TextArea
            placeholder="Share your experience"
            value={comment}
            onChangeText={setComment}
            numberOfLines={3}
            disabled={submitReview.isPending || isSubmitted}
            borderRadius="$6"
            backgroundColor="$background"
            color="$foreground"
            placeholderTextColor="$mutedForeground"
          />

          <Button
            variant="primary"
            size="sm"
            onPress={handleSubmitReview}
            disabled={rating === 0 || submitReview.isPending || isSubmitted}
          >
            {submitReview.isPending 
              ? "Submitting..." 
              : "Submit Review"}
          </Button>
        </>
      )}

      <XStack
        position="absolute"
        top={-8}
        left={8}
        backgroundColor="$foreground"
        paddingHorizontal="$2"
        paddingVertical="$1"
        borderRadius="$6"
        zIndex={1}
      >
        <Text fontSize="$2" color="$background" fontWeight="600">
          {isSubmitted ? "Review Submitted" : "Submit Review"}
        </Text>
      </XStack>
    </YStack>
  );
}