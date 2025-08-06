import { useUnvoteListing, useVoteListing } from "@/hooks/queries/use-listing";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useRef, useState } from "react";
import { Text, useTheme, View, XStack } from "tamagui";

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

  // Local state for instant UI updates
  const [currentVotes, setCurrentVotes] = useState(totalVotes);
  const [currentIsUpvoted, setCurrentIsUpvoted] = useState(isUpvoted);
  const [lastListingId, setLastListingId] = useState(listingId);

  // Sync with props when listingId changes or when props update from server
  useEffect(() => {
    if (listingId !== lastListingId) {
      setCurrentVotes(totalVotes);
      setCurrentIsUpvoted(isUpvoted);
      setLastListingId(listingId);
    }
  }, [listingId, totalVotes, isUpvoted, lastListingId]);

  // Debounce refs
  const debounceTimeoutRef = useRef<number | null>(null);

  // Determine icon names and colors based on current vote state
  const upvoteIcon =
    currentIsUpvoted === true ? "caret-up-circle" : "caret-up-circle-outline";
  const downvoteIcon =
    currentIsUpvoted === false
      ? "caret-down-circle"
      : "caret-down-circle-outline";

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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);

    // Instant UI update
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);

    // Instant UI update
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
        <View onPress={() => handleUpvote()} hitSlop={10}>
          <Ionicons name={upvoteIcon} size={30} color={theme.foreground?.val} />
        </View>
        <Text fontSize="$5" fontWeight="500">
          {currentVotes}
        </Text>
        <View
          onPress={() => handleDownvote()}
          hitSlop={10}
          pressStyle={{ opacity: 0.6, scale: 0.95 }}
        >
          <Ionicons
            name={downvoteIcon}
            size={30}
            color={theme.foreground?.val}
          />
        </View>
      </XStack>
    </XStack>
  );
}
