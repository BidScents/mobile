import {
  RichConfirmReceiptActionContent,
  RichSubmitReviewActionContent,
} from "@bid-scents/shared-sdk";
import { Button, Text, View } from "tamagui";

interface SystemMessageProps {
  content: RichConfirmReceiptActionContent | RichSubmitReviewActionContent;
  isCurrentUser: boolean;
}

export function SystemMessage({ content, isCurrentUser }: SystemMessageProps) {
  const isConfirmReceipt = "buyer_id" in content;
  const isSubmitReview = !isConfirmReceipt;

  const getSystemText = () => {
    if (isConfirmReceipt) {
      return isCurrentUser 
        ? "You requested receipt confirmation"
        : "Receipt confirmation requested";
    }
    return isCurrentUser
      ? "You requested a review"
      : "Review submission requested";
  };

  const getActionButtonText = () => {
    if (isConfirmReceipt) {
      return "Confirm Receipt";
    }
    return "Submit Review";
  };

  return (
    <View
      padding="$3"
      backgroundColor={isCurrentUser ? "$blue1" : "$backgroundPress"}
      borderRadius="$3"
      borderWidth={1}
      borderColor={isCurrentUser ? "$blue5" : "$borderColor"}
      alignSelf={isCurrentUser ? "flex-end" : "flex-start"}
      maxWidth="80%"
    >
      {content.listing && (
        <View marginBottom="$2">
          <Text
            fontSize="$3"
            fontWeight="600"
            color={isCurrentUser ? "$blue11" : "$color"}
            numberOfLines={1}
          >
            {content.listing.name}
          </Text>
        </View>
      )}
      
      <Text
        fontSize="$4"
        fontWeight="500"
        color={isCurrentUser ? "$blue11" : "$color"}
        marginBottom="$2"
      >
        {getSystemText()}
      </Text>

      {content.is_active && (
        <Button
          size="$3"
          backgroundColor={isCurrentUser ? "blue" : "gray"}
          disabled={!content.is_active}
        >
          <Text
            fontSize="$3"
            fontWeight="600"
            color="$white"
          >
            {getActionButtonText()}
          </Text>
        </Button>
      )}

      {!content.is_active && (
        <Text
          fontSize="$2"
          color="$color11"
          fontStyle="italic"
        >
          {isConfirmReceipt ? "Receipt confirmed" : "Review submitted"}
        </Text>
      )}
    </View>
  );
}