import { useAuthStore } from "@bid-scents/shared-sdk";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { Keyboard } from "react-native";
import { View, XStack } from "tamagui";
import { useAddComment } from "../../hooks/queries/use-listing";
import { Input } from "../ui/input";
import { ThemedIonicons } from "../ui/themed-icons";

interface AddCommentFormProps {
  listingId: string;
}

/**
 * Form component for adding new comments
 * Handles input state and submission with haptic feedback
 */
export function AddCommentForm({ listingId }: AddCommentFormProps) {
  const [newComment, setNewComment] = useState("");
  const addComment = useAddComment();
  const { isAuthenticated } = useAuthStore();

  const handlePostComment = () => {
    if (newComment.trim()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      addComment.mutate({ listingId, content: newComment });
      setNewComment("");
      Keyboard.dismiss();
    }
  };

  return (
    <XStack alignItems="center" gap="$2" paddingTop="$2">
      <View flex={1}>
        <Input
          placeholder="Add a comment..."
          variant="multiline"
          value={newComment}
          onChangeText={setNewComment}
          numberOfLines={2}
          disabled={!isAuthenticated}
        />
      </View>
      <View
        hitSlop={30}
        pressStyle={{ opacity: 0.6, scale: 0.93 }}
        onPress={handlePostComment}
      >
        <ThemedIonicons
          name="send"
          size={30}
          themeColor={!newComment.trim() ? "muted" : "foreground"}
        />
      </View>
    </XStack>
  );
}