import { useUnvoteListing, useVoteListing } from "@/hooks/queries/use-listing";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useCallback, useRef, useState } from "react";
import { Text, XStack, useTheme } from "tamagui";

export function VoteButtons({
  totalVotes,
  isUpvoted,
  listingId,
}: {
  totalVotes: number;
  isUpvoted?: boolean | null;
  listingId: string;
}) {
  const theme = useTheme();
  const voteListing = useVoteListing();
  const unvoteListing = useUnvoteListing();

  // Initialize state only once - don't sync with props after that
  const [currentVotes, setCurrentVotes] = useState(totalVotes);
  const [currentIsUpvoted, setCurrentIsUpvoted] = useState(isUpvoted);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize state only on first render or when listingId changes
  if (!isInitialized || currentVotes === 0) {
    setCurrentVotes(totalVotes);
    setCurrentIsUpvoted(isUpvoted);
    setIsInitialized(true);
  }

  // Debounce refs
  const debounceTimeoutRef = useRef<number | null>(null);

  // Determine icon names and colors based on current vote state
  const upvoteIcon =
    currentIsUpvoted === true ? "thumbs-up" : "thumbs-up-outline";
  const downvoteIcon =
    currentIsUpvoted === false ? "thumbs-down" : "thumbs-down-outline";

  const debouncedVote = useCallback(
    (action: "upvote" | "downvote" | "unvote") => {
      // Clear existing timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Set new timeout
      debounceTimeoutRef.current = setTimeout(() => {
        switch (action) {
          case "upvote":
            voteListing.mutate({ listingId, isUpvote: true });
            break;
          case "downvote":
            voteListing.mutate({ listingId, isUpvote: false });
            break;
          case "unvote":
            unvoteListing.mutate(listingId);
            break;
        }
      }, 500); // 500ms debounce
    },
    [voteListing, unvoteListing, listingId]
  );

  const handleUpvote = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Immediate UI update
    if (currentIsUpvoted === true) {
      // Remove upvote
      setCurrentVotes((prev) => prev - 1);
      setCurrentIsUpvoted(null);
      debouncedVote("unvote");
    } else {
      // Add upvote or change from downvote to upvote
      const voteDiff = currentIsUpvoted === false ? 2 : 1;
      setCurrentVotes((prev) => prev + voteDiff);
      setCurrentIsUpvoted(true);
      debouncedVote("upvote");
    }
  }, [currentIsUpvoted, debouncedVote]);

  const handleDownvote = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Immediate UI update
    if (currentIsUpvoted === false) {
      // Remove downvote
      setCurrentVotes((prev) => prev + 1);
      setCurrentIsUpvoted(null);
      debouncedVote("unvote");
    } else {
      // Add downvote or change from upvote to downvote
      const voteDiff = currentIsUpvoted === true ? -2 : -1;
      setCurrentVotes((prev) => prev + voteDiff);
      setCurrentIsUpvoted(false);
      debouncedVote("downvote");
    }
  }, [currentIsUpvoted, debouncedVote]);

  return (
    <XStack alignItems="center" justifyContent="center" gap="$2">
      <XStack alignItems="center" gap="$2">
        <Ionicons
          name={upvoteIcon}
          size={28}
          color={theme.foreground?.val}
          onPress={() => handleUpvote()}
        />
        <Text fontSize="$4" fontWeight="400">
          {currentVotes}
        </Text>
        <Ionicons
          name={downvoteIcon}
          size={28}
          color={theme.foreground?.val}
          onPress={() => handleDownvote()}
        />
      </XStack>
    </XStack>
  );
}
