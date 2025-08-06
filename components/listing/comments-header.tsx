import { Text, XStack } from "tamagui";
import { VoteButtons } from "./vote-buttons";

interface CommentsHeaderProps {
  totalVotes: number;
  isUpvoted: boolean | null;
  listingId: string;
}

/**
 * Comments section header with vote buttons
 * Displays "Comments" title and like/dislike voting functionality
 */
export function CommentsHeader({ totalVotes, isUpvoted, listingId }: CommentsHeaderProps) {
  return (
    <XStack alignItems="center" justifyContent="space-between">
      <Text fontSize="$8" fontWeight="600" color="$foreground">
        Comments
      </Text>

      {/* Like/Dislike Buttons */}
      <VoteButtons
        totalVotes={totalVotes}
        isUpvoted={isUpvoted}
        listingId={listingId}
      />
    </XStack>
  );
}