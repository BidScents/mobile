import { CommentDetails } from "@bid-scents/shared-sdk";
import { View } from "tamagui";
import { EditBottomSheet } from "../forms/edit-bottom-sheet";
import { AddCommentForm } from "./add-comment-form";
import { CommentsList } from "./comments-list";
import { useCommentsLogic } from "./use-comments-logic";

interface CommentsSectionProps {
  comments: CommentDetails[] | null | undefined;
  userId: string | undefined;
  sellerId: string;
  listingId: string;
}

/**
 * Main comments section component
 * Orchestrates comments display, editing, and adding new comments
 */
export function CommentsSection({
  comments,
  userId,
  sellerId,
  listingId,
}: CommentsSectionProps) {
  const {
    selectedComment,
    editBottomSheetRef,
    handleEditComment,
    handleEditConfirm,
    handleDeleteConfirm,
  } = useCommentsLogic({ listingId, comments });

  return (
    <View gap="$3">
      {/* Comments List */}
      <CommentsList
        comments={comments}
        userId={userId}
        sellerId={sellerId}
        onEditComment={handleEditComment}
      />

      {/* Add Comment Form */}
      <AddCommentForm listingId={listingId} />

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
