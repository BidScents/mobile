import { Text, View } from "tamagui";

/**
 * Comments section header
 * Displays "Comments" title
 */
export function CommentsHeader() {
  return (
    <View>
      <Text fontSize="$8" fontWeight="600" color="$foreground">
        Comments
      </Text>
    </View>
  );
}