import { CommentDetails } from "@bid-scents/shared-sdk";
import { useState } from "react";
import { Text, View, YStack } from "tamagui";
import { Button } from "../ui/button";
import { CommentItem } from "./comment-item";

interface CommentsListProps {
  comments: CommentDetails[] | null | undefined;
  userId: string | undefined;
  sellerId: string;
  onEditComment: (commentId: string) => void;
}

/**
 * Comments list with pagination functionality
 * Shows initial 5 comments with load more capability
 */
export function CommentsList({ 
  comments, 
  userId, 
  sellerId, 
  onEditComment 
}: CommentsListProps) {
  const [visibleCommentsCount, setVisibleCommentsCount] = useState(5);

  // Helper functions
  const isUserSeller = (commenterId: string) => commenterId === sellerId;
  const isCurrentUser = (commenterId: string) => commenterId === userId;
  
  const handleShowMore = () => {
    setVisibleCommentsCount((prev) => prev + 5);
  };

  // Get comments to display
  const visibleComments = comments?.slice(0, visibleCommentsCount) || [];
  const hasMoreComments = (comments?.length || 0) > visibleCommentsCount;

  if (!comments?.length) {
    return (
      <View
        padding="$6"
        borderRadius="$4"
        alignItems="center"
        justifyContent="center"
      >
        <Text
          fontSize="$5"
          fontWeight="600"
          color="$mutedForeground"
          textAlign="center"
          marginBottom="$2"
        >
          No Comments Yet
        </Text>
        <Text fontSize="$3" color="$mutedForeground" textAlign="center">
          Be the first to leave a comment about this listing.
        </Text>
      </View>
    );
  }

  return (
    <YStack gap="$3">
      {visibleComments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          isUserSeller={isUserSeller(comment.commenter?.id || "")}
          isCurrentUser={isCurrentUser(comment.commenter?.id || "")}
          onEdit={onEditComment}
        />
      ))}

      {/* Show More Button */}
      {hasMoreComments && (
        <View alignItems="center" flex={1}>
          <Button
            variant="secondary"
            size="sm"
            onPress={handleShowMore}
            fullWidth
          >
            <Text fontSize="$3" fontWeight="500" color="$foreground">
              Show More
            </Text>
          </Button>
        </View>
      )}
    </YStack>
  );
}