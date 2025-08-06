import { CommentDetails } from "@bid-scents/shared-sdk";
import { router } from "expo-router";
import { Text, View, XStack, YStack } from "tamagui";
import { formatDate } from "../../utils/utility-functions";
import { AvatarIcon } from "../ui/avatar-icon";
import { ShowMoreText } from "../ui/show-more-text";

interface CommentItemProps {
  comment: CommentDetails;
  isUserSeller: boolean;
  isCurrentUser: boolean;
  onEdit: (commentId: string) => void;
}

/**
 * Individual comment item component
 * Displays user avatar, seller badge, comment content, and edit functionality
 */
export function CommentItem({ 
  comment, 
  isUserSeller, 
  isCurrentUser, 
  onEdit 
}: CommentItemProps) {
  return (
    <XStack key={comment.id} gap="$3" width="100%">
      <AvatarIcon
        url={comment.commenter?.profile_image_url}
        size="$4"
        onClick={() => router.push(`/profile/${comment.commenter?.id}`)}
      />

      <YStack gap="$1" flex={1} minWidth={0}>
        {/* Comment Header */}
        <XStack
          alignItems="center"
          justifyContent="space-between"
          gap="$2"
          flexWrap="wrap"
        >
          <XStack alignItems="center" gap="$2" flex={1} minWidth={0}>
            {/* Seller Badge */}
            {isUserSeller && (
              <View
                px="$2"
                py="$1.5"
                backgroundColor="$foreground"
                borderRadius="$5"
              >
                <Text
                  fontSize="$1"
                  fontWeight="bold"
                  color="$background"
                >
                  SELLER
                </Text>
              </View>
            )}
            
            <Text
              fontSize="$4"
              fontWeight="500"
              flexShrink={1}
              numberOfLines={1}
            >
              {comment.commenter?.username}
            </Text>

            <Text fontSize="$3" color="$gray10" flexShrink={0}>
              {formatDate(comment.created_at)}
            </Text>
          </XStack>

          {/* Edit Button */}
          {isCurrentUser && (
            <View
              onPress={() => onEdit(comment.id)}
              hitSlop={20}
              pressStyle={{ opacity: 0.6, scale: 0.93 }}
              borderRadius="$10"
            >
              <Text
                fontSize="$1"
                fontWeight="500"
                color="$mutedForeground"
              >
                Edit
              </Text>
            </View>
          )}
        </XStack>

        {/* Comment Content */}
        <ShowMoreText
          lines={1}
          more="Show more"
          less="Show less"
          buttonColor="$blue10"
          fontSize="$4"
          fontWeight="400"
          color="$foreground"
        >
          {comment.content}
        </ShowMoreText>
      </YStack>
    </XStack>
  );
}