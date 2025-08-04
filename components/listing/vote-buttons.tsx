import { useUnvoteListing, useVoteListing } from "@/hooks/queries/use-listing";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Text, XStack, useTheme } from "tamagui";

export function VoteButtons({totalVotes, isUpvoted, listingId}: {totalVotes: number, isUpvoted?: boolean | null, listingId: string}) {
    const theme = useTheme();
    const voteListing = useVoteListing();
    const unvoteListing = useUnvoteListing();
    
    // Determine icon names and colors based on vote state
    const upvoteIcon = isUpvoted === true ? "thumbs-up" : "thumbs-up-outline";
    const downvoteIcon = isUpvoted === false ? "thumbs-down" : "thumbs-down-outline";
    
    const handleUpvote = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (isUpvoted === true) {
            unvoteListing.mutate(listingId);
        } else {
            voteListing.mutate({ listingId, isUpvote: true });
        }
    }
    const handleDownvote = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (isUpvoted === false) {
            unvoteListing.mutate(listingId);
        } else {
            voteListing.mutate({ listingId, isUpvote: false });
        }
    }
    
    return (
        <XStack alignItems="center" justifyContent="center" gap="$2">
            <XStack alignItems="center" gap="$2">
                <Ionicons name={upvoteIcon} size={28} color={theme.foreground?.val} onPress={() => handleUpvote()} />
                <Text fontSize="$4" fontWeight="400">{totalVotes}</Text>
                <Ionicons name={downvoteIcon} size={28} color={theme.foreground?.val} onPress={() => handleDownvote()} />
            </XStack>
        </XStack>
    )
}