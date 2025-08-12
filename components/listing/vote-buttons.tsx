import { useUnvoteListing, useVoteListing } from "@/hooks/queries/use-listing";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useRef, useState } from "react";
import { Text, useTheme, View, XStack } from "tamagui";

/**
 * VoteButtons Component
 * 
 * Handles upvoting and downvoting for listings with dual state management:
 * 1. Local state for instant UI feedback
 * 2. Cache updates via mutations for persistence
 */
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

  // Local state for instant UI updates (prevents delay while server processes)
  const [currentVotes, setCurrentVotes] = useState(totalVotes);
  const [currentIsUpvoted, setCurrentIsUpvoted] = useState(isUpvoted);
  const [lastListingId, setLastListingId] = useState(listingId);

  // Sync local state with server props when listing changes or server updates
  useEffect(() => {
    if (listingId !== lastListingId) {
      setCurrentVotes(totalVotes);
      setCurrentIsUpvoted(isUpvoted);
      setLastListingId(listingId);
    }
  }, [listingId, totalVotes, isUpvoted, lastListingId]);

  // Debounce timeout for spam protection
  const debounceTimeoutRef = useRef<number | null>(null);

  // Dynamic icons based on current vote state
  const upvoteIcon =
    currentIsUpvoted === true ? "caret-up-circle" : "caret-up-circle-outline";
  const downvoteIcon =
    currentIsUpvoted === false
      ? "caret-down-circle"
      : "caret-down-circle-outline";

  /**
   * Debounced server call to prevent spam
   * Waits 500ms before sending request to server
   */
  const debouncedVote = useCallback(
    (action: "upvote" | "downvote" | "unvote") => {
      // Clear any pending vote to replace with new one
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Queue the server call after debounce period
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
      }, 300);
    },
    [voteListing, unvoteListing, listingId]
  );

  /**
   * Handle upvote button press
   * 
   * Logic:
   * - If already upvoted: Remove upvote (unvote)
   * - If downvoted: Switch to upvote (+2 total change)
   * - If no vote: Add upvote (+1 total change)
   */
  const handleUpvote = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);

    if (currentIsUpvoted === true) {
      // Remove existing upvote
      setCurrentVotes((prev) => prev - 1);
      setCurrentIsUpvoted(null);
      debouncedVote("unvote");
    } else {
      // Add upvote (or switch from downvote)
      const voteDiff = currentIsUpvoted === false ? 2 : 1; // +2 if switching, +1 if new
      setCurrentVotes((prev) => prev + voteDiff);
      setCurrentIsUpvoted(true);
      debouncedVote("upvote");
    }
  }, [currentIsUpvoted, debouncedVote]);

  /**
   * Handle downvote button press
   * 
   * Logic:
   * - If already downvoted: Remove downvote (unvote)
   * - If upvoted: Switch to downvote (-2 total change)
   * - If no vote: Add downvote (-1 total change)
   */
  const handleDownvote = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);

    if (currentIsUpvoted === false) {
      // Remove existing downvote
      setCurrentVotes((prev) => prev + 1);
      setCurrentIsUpvoted(null);
      debouncedVote("unvote");
    } else {
      // Add downvote (or switch from upvote)
      const voteDiff = currentIsUpvoted === true ? -2 : -1; // -2 if switching, -1 if new
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
