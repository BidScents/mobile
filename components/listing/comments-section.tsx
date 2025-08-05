import { CommentDetails } from "@bid-scents/shared-sdk";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { Text, View, XStack, YStack } from "tamagui";
import { formatDate } from "../../utils/utility-functions";
import { AvatarIcon } from "../ui/avatar-icon";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export function CommentsSection({
  comments,
  userId,
  sellerId,
}: {
  comments: CommentDetails[] | null | undefined;
  userId: string | undefined;
  sellerId: string;
}) {
  const [newComment, setNewComment] = useState("");

  // Helper function to determine if user is seller
  const isUserSeller = (commenterId: string) => commenterId === sellerId;
  const isCurrentUser = (commenterId: string) => commenterId === userId;

  const handlePostComment = () => {
    if (newComment.trim()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      // TODO: Implement comment posting logic
      console.log("Posting comment:", newComment);
      setNewComment("");
    }
  };

  const handleEditComment = (commentId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Implement comment editing logic
    console.log("Editing comment:", commentId);
  };

  return (
    <View gap="$4">
      {/* Comments List */}
      {comments?.length ? (
        <YStack gap="$3">
          {comments.map((comment) => (
            <XStack key={comment.id} gap="$3" width="100%">
              <AvatarIcon
                url={comment.commenter?.profile_image_url}
                size="$4"
              />

              <YStack gap="$1" flex={1} minWidth={0}>
                {/* Comment Header */}
                <XStack
                  alignItems="center"
                  justifyContent="space-between"
                  gap="$2"
                  flexWrap="wrap"
                >
                  <XStack alignItems="center" gap="$2" flex={1} minWidth={0}>
                    {/* Seller badge */}
                    {isUserSeller(comment.commenter?.id || "") && (
                      <View
                        px="$2"
                        py="$1.5"
                        backgroundColor="$foreground"
                        borderRadius="$5"
                      >
                        <Text
                          fontSize="$1"
                          fontWeight="bold"
                          color="$background"
                        >
                          SELLER
                        </Text>
                      </View>
                    )}
                    <Text
                      fontSize="$4"
                      fontWeight="500"
                      flexShrink={1}
                      numberOfLines={1}
                    >
                      {comment.commenter?.username}
                    </Text>

                    <Text fontSize="$3" color="$gray10" flexShrink={0}>
                      {formatDate(comment.created_at)}
                    </Text>
                  </XStack>

                  {/* Edit button for current user */}
                  {isCurrentUser(comment.commenter?.id || "") && (
                    <View
                      onPress={() => handleEditComment(comment.id)}
                      hitSlop={20}
                      pressStyle={{ opacity: 0.6 }}
                    >
                      <Text fontSize="$2" fontWeight="bold" color="$blue10">
                        Edit
                      </Text>
                    </View>
                  )}
                </XStack>

                {/* Comment Content */}
                <Text
                  fontSize="$4"
                  fontWeight="400"
                  lineHeight="$4"
                  flexWrap="wrap"
                >
                  {comment.content}
                </Text>
              </YStack>
            </XStack>
          ))}
        </YStack>
      ) : (
        <View
          padding="$6"
          backgroundColor="$gray1"
          borderRadius="$4"
          alignItems="center"
          justifyContent="center"
        >
          <Text
            fontSize="$5"
            fontWeight="600"
            color="$gray11"
            textAlign="center"
            marginBottom="$2"
          >
            No Comments Yet
          </Text>
          <Text fontSize="$3" color="$gray10" textAlign="center">
            Be the first to leave a comment about this listing.
          </Text>
        </View>
      )}

      {/* Add Comment Section */}
      <XStack alignItems="flex-end" gap="$3" paddingTop="$2">
        {/* <AvatarIcon url={user?.profile_image_url} size="$4" /> */}
        <View flex={1}>
          <Input
            placeholder="Add a comment..."
            variant="text"
            value={newComment}
            onChangeText={setNewComment}
            numberOfLines={2}
          />
        </View>
        <Button
          variant="primary"
          size="md"
          onPress={handlePostComment}
          disabled={!newComment.trim()}
        >
          Post
        </Button>
      </XStack>
    </View>
  );
}

// Debug version to check your data structure
export function CommentsDebugSection({
  comments,
  userId,
  sellerId,
}: {
  comments: CommentDetails[] | null | undefined;
  userId: string;
  sellerId: string;
}) {
  console.log("Comments data:", JSON.stringify(comments, null, 2));

  return (
    <View gap="$3">
      <Text fontSize="$7" fontWeight="500">
        Comments Debug
      </Text>

      <Text fontSize="$3" fontFamily="$mono">
        {JSON.stringify(comments, null, 2)}
      </Text>

      {/* Use the fixed component above */}
      <CommentsSection
        comments={comments}
        userId={userId}
        sellerId={sellerId}
      />
    </View>
  );
}
