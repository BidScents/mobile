import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { Keyboard } from "react-native";
import { View, XStack, useTheme } from "tamagui";
import { useAddComment } from "../../hooks/queries/use-listing";
import { Input } from "../ui/input";

interface AddCommentFormProps {
  listingId: string;
}

/**
 * Form component for adding new comments
 * Handles input state and submission with haptic feedback
 */
export function AddCommentForm({ listingId }: AddCommentFormProps) {
  const [newComment, setNewComment] = useState("");
  const theme = useTheme();
  const addComment = useAddComment();

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
              ? theme.mutedForeground?.get()
              : theme.foreground?.get()
          }
        />
      </View>
    </XStack>
  );
}