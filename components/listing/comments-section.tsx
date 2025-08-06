import { CommentDetails } from "@bid-scents/shared-sdk";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { Text, View, XStack, YStack, useTheme } from "tamagui";
import {
  useAddComment,
  useDeleteComment,
  useUpdateComment,
} from "../../hooks/queries/use-listing";
import { formatDate } from "../../utils/utility-functions";
import {
  EditBottomSheet,
  EditBottomSheetMethods,
} from "../forms/edit-bottom-sheet";
import { AvatarIcon } from "../ui/avatar-icon";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ShowMoreText } from "../ui/show-more-text";

export function CommentsSection({
  comments,
  userId,
  sellerId,
  listingId,
}: {
  comments: CommentDetails[] | null | undefined;
  userId: string | undefined;
  sellerId: string;
  listingId: string;
}) {
  const [newComment, setNewComment] = useState("");
  const [visibleCommentsCount, setVisibleCommentsCount] = useState(5);
  const [selectedComment, setSelectedComment] = useState<CommentDetails | null>(
    null
  );
  const theme = useTheme();
  const editBottomSheetRef = useRef<EditBottomSheetMethods>(null);

  // Helper function to determine if user is seller
  const isUserSeller = (commenterId: string) => commenterId === sellerId;
  const isCurrentUser = (commenterId: string) => commenterId === userId;
  const addComment = useAddComment();
  const updateComment = useUpdateComment();
  const deleteComment = useDeleteComment();

  const handlePostComment = () => {
    if (newComment.trim()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      addComment.mutate({ listingId, content: newComment });
      console.log("Posting comment:", newComment);
      setNewComment("");
    }
  };

  const handleEditComment = (commentId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const comment = comments?.find((c) => c.id === commentId);
    if (comment) {
      setSelectedComment(comment);
      editBottomSheetRef.current?.present();
    }
  };

  const handleEditConfirm = (newText: string) => {
    if (selectedComment) {
      updateComment.mutate({
        commentId: selectedComment.id,
        content: newText,
        listingId,
      });
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedComment) {
      deleteComment.mutate({
        commentId: selectedComment.id,
        listingId,
      });
    }
  };

  const handleShowMore = () => {
    setVisibleCommentsCount((prev) => prev + 5);
  };

  // Get the comments to display based on visible count
  const visibleComments = comments?.slice(0, visibleCommentsCount) || [];
  const hasMoreComments = (comments?.length || 0) > visibleCommentsCount;

  return (
    <View gap="$3">
      {/* Comments List */}
      {comments?.length ? (
        <YStack gap="$3">
          {visibleComments.map((comment) => (
            <XStack key={comment.id} gap="$3" width="100%">
              <AvatarIcon
                url={comment.commenter?.profile_image_url}
                size="$4"
                onClick={() => router.push(`/profile/${comment.commenter?.id}`)}
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
                      pressStyle={{ opacity: 0.6, scale: 0.93 }}
                      borderRadius="$10"
                    >
                      <Text
                        fontSize="$1"
                        fontWeight="500"
                        color="$mutedForeground"
                      >
                        Edit
                      </Text>
                    </View>
                  )}
                </XStack>

                {/* Comment Content */}
                <ShowMoreText
                  lines={1}
                  more="Show more"
                  less="Show less"
                  buttonColor="$blue10"
                  fontSize="$4"
                  fontWeight="400"
                  color="$foreground"
                >
                  {comment.content}
                </ShowMoreText>
              </YStack>
            </XStack>
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
      <XStack alignItems="center" gap="$2" paddingTop="$2">
        {/* <AvatarIcon url={user?.profile_image_url} size="$4" /> */}
        <View flex={1}>
          <Input
            placeholder="Add a comment..."
            variant="multiline"
            value={newComment}
            onChangeText={setNewComment}
            numberOfLines={2}
          />
        </View>
        <View
          hitSlop={30}
          pressStyle={{ opacity: 0.6, scale: 0.93 }}
          onPress={handlePostComment}
        >
          <Ionicons
            name="send"
            size={30}
            color={
              !newComment.trim()
                ? theme.mutedForeground?.val
                : theme.foreground?.val
            }
          />
        </View>
      </XStack>

      {/* Edit Bottom Sheet */}
      <EditBottomSheet
        ref={editBottomSheetRef}
        initialText={selectedComment?.content || ""}
        onEdit={handleEditConfirm}
        onDelete={handleDeleteConfirm}
        placeholder="Edit your comment..."
        title="Edit Comment"
        subtitle="Choose what you'd like to do with your comment"
        editButtonText="Edit Comment"
        deleteButtonText="Delete Comment"
      />
    </View>
  );
}
