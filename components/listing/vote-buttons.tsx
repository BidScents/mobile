import { queryKeys } from "@/hooks/queries/query-keys";
import { useUnvoteListing, useVoteListing } from "@/hooks/queries/use-listing";
import { useOptimisticMutation } from "@/hooks/use-optimistic-mutation";
import type { ListingDetailsResponse } from "@bid-scents/shared-sdk";
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useState } from "react";
import { Text, useTheme, View, XStack } from "tamagui";

/**
 * VoteButtons Component
 * 
 * Uses optimistic mutation hook for clean debounced voting with instant UI feedback
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
  const queryClient = useQueryClient();
  const voteListing = useVoteListing();
  const unvoteListing = useUnvoteListing();

  // Local state for instant UI updates
  const [currentVotes, setCurrentVotes] = useState(totalVotes);
  const [currentIsUpvoted, setCurrentIsUpvoted] = useState(isUpvoted);
  const [lastListingId, setLastListingId] = useState(listingId);

  // Sync local state with server props when listing changes
  useEffect(() => {
    if (listingId !== lastListingId) {
      setCurrentVotes(totalVotes);
      setCurrentIsUpvoted(isUpvoted);
      setLastListingId(listingId);
    }
  }, [listingId, totalVotes, isUpvoted, lastListingId]);

  type VoteAction = { action: "upvote" | "downvote" | "unvote" };

  const optimisticVote = useOptimisticMutation<any, VoteAction>({
    mutationFn: async ({ action }: VoteAction) => {
      switch (action) {
        case "upvote":
          return voteListing.mutateAsync({ listingId, isUpvote: true });
        case "downvote":
          return voteListing.mutateAsync({ listingId, isUpvote: false });
        case "unvote":
          return unvoteListing.mutateAsync(listingId);
      }
    },
    onOptimisticUpdate: ({ action }: VoteAction) => {
      // Update local state immediately
      if (action === "upvote") {
        const voteDiff = currentIsUpvoted === false ? 2 : 1;
        setCurrentVotes((prev) => prev + voteDiff);
        setCurrentIsUpvoted(true);
      } else if (action === "downvote") {
        const voteDiff = currentIsUpvoted === true ? -2 : -1;
        setCurrentVotes((prev) => prev + voteDiff);
        setCurrentIsUpvoted(false);
      } else if (action === "unvote") {
        const voteDiff = currentIsUpvoted === true ? -1 : currentIsUpvoted === false ? 1 : 0;
        setCurrentVotes((prev) => prev + voteDiff);
        setCurrentIsUpvoted(null);
      }

      // Update cache immediately for consistency
      queryClient.setQueryData<ListingDetailsResponse>(
        queryKeys.listings.detail(listingId),
        (old) => {
          if (!old) return old;
          
          let newVotes = old.total_votes;
          let newIsUpvoted = old.is_upvoted;
          
          if (action === "upvote") {
            const voteDiff = old.is_upvoted === false ? 2 : 1;
            newVotes = old.total_votes + voteDiff;
            newIsUpvoted = true;
          } else if (action === "downvote") {
            const voteDiff = old.is_upvoted === true ? -2 : -1;
            newVotes = old.total_votes + voteDiff;
            newIsUpvoted = false;
          } else if (action === "unvote") {
            const voteDiff = old.is_upvoted === true ? -1 : old.is_upvoted === false ? 1 : 0;
            newVotes = old.total_votes + voteDiff;
            newIsUpvoted = null;
          }
          
          return {
            ...old,
            total_votes: newVotes,
            is_upvoted: newIsUpvoted,
          };
        }
      );
    },
    onRevert: () => {
      // Revert to server state on error
      setCurrentVotes(totalVotes);
      setCurrentIsUpvoted(isUpvoted);
    },
    debounceMs: 300,
  });

  // Dynamic icons based on current vote state
  const upvoteIcon = currentIsUpvoted === true ? "caret-up-circle" : "caret-up-circle-outline";
  const downvoteIcon = currentIsUpvoted === false ? "caret-down-circle" : "caret-down-circle-outline";

  const handleUpvote = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);

    if (currentIsUpvoted === true) {
      optimisticVote.mutate({ action: "unvote" });
    } else {
      optimisticVote.mutate({ action: "upvote" });
    }
  }, [currentIsUpvoted, optimisticVote]);

  const handleDownvote = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);

    if (currentIsUpvoted === false) {
      optimisticVote.mutate({ action: "unvote" });
    } else {
      optimisticVote.mutate({ action: "downvote" });
    }
  }, [currentIsUpvoted, optimisticVote]);

  return (
    <XStack alignItems="center" justifyContent="center" gap="$2">
      <XStack alignItems="center" gap="$2">
        <View onPress={() => handleUpvote()} hitSlop={10}>
          <Ionicons name={upvoteIcon} size={30} color={theme.foreground?.get()} />
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
            color={theme.foreground?.get()}
          />
        </View>
      </XStack>
    </XStack>
  );
}
