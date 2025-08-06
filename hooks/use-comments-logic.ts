import { CommentDetails } from "@bid-scents/shared-sdk";
import * as Haptics from "expo-haptics";
import { useRef, useState } from "react";
import { EditBottomSheetMethods } from "../components/forms/edit-bottom-sheet";
import { useDeleteComment, useUpdateComment } from "./queries/use-listing";

interface UseCommentsLogicProps {
  listingId: string;
  comments: CommentDetails[] | null | undefined;
}

/**
 * Custom hook for managing comments business logic
 * Handles editing, deleting, and state management
 */
export function useCommentsLogic({ listingId, comments }: UseCommentsLogicProps) {
  const [selectedComment, setSelectedComment] = useState<CommentDetails | null>(null);
  const editBottomSheetRef = useRef<EditBottomSheetMethods>(null);
  
  const updateComment = useUpdateComment();
  const deleteComment = useDeleteComment();

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

  return {
    selectedComment,
    editBottomSheetRef,
    handleEditComment,
    handleEditConfirm,
    handleDeleteConfirm,
  };
}