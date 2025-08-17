import { AvatarIcon } from "@/components/ui/avatar-icon";
import { formatDate } from "@/utils/utility-functions";
import {
  AuctionExpiryContent,
  CommentContent,
  FollowedSellerListingContent,
  FollowerContent,
  ListingContent,
  MessageContent,
  NotificationData,
  NotificationType,
  OutbidContent,
} from "@bid-scents/shared-sdk";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Text, XStack, YStack, useTheme } from "tamagui";

const LISTING_RELATED_NOTIFICATION_TYPES = [
  NotificationType.LISTING_FAVORITED,
  NotificationType.FAVORITE_LISTING_EDITED,
  NotificationType.LISTING_BID,
  NotificationType.OUTBID,
  NotificationType.AUCTION_EXPIRY,
  NotificationType.AUCTION_EXTENSION,
  NotificationType.FOLLOWED_SELLER_LISTING,
  NotificationType.LISTING_COMMENT,
];

export default function NotificationCard({
  notification,
}: {
  notification: NotificationData;
}) {
  const theme = useTheme();

  const getImageContent = () => {
    const isListingRelated = LISTING_RELATED_NOTIFICATION_TYPES.includes(
      notification.type
    );

    if (isListingRelated) {
      const content = notification.content as
        | ListingContent
        | OutbidContent
        | AuctionExpiryContent
        | CommentContent
        | FollowedSellerListingContent;

      let imageUrl: string | undefined;
      if ("listing" in content && content.listing.image_url) {
        imageUrl = content.listing.image_url;
      }

      return (
        <Image
          source={{
            uri: imageUrl
              ? `${process.env.EXPO_PUBLIC_IMAGE_BASE_URL}${imageUrl}`
              : undefined,
          }}
          style={{
            width: 60,
            height: 60,
            borderRadius: 6,
            backgroundColor: theme.muted?.get(),
          }}
          contentFit="cover"
        />
      );
    }

    // User-related notifications show profile avatar
    if (notification.type === NotificationType.NEW_FOLLOWER) {
      const content = notification.content as FollowerContent;
      return <AvatarIcon url={content.follower.profile_image_url} size="$5" />;
    }

    if (notification.type === NotificationType.MESSAGE) {
      const content = notification.content as MessageContent;
      return <AvatarIcon url={content.sender.profile_image_url} size="$5" />;
    }

    // Default fallback
    return <AvatarIcon url={null} size="$5" />;
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (LISTING_RELATED_NOTIFICATION_TYPES.includes(notification.type)) {
      const content = notification.content as
        | ListingContent
        | OutbidContent
        | AuctionExpiryContent
        | CommentContent
        | FollowedSellerListingContent;
      if ("listing" in content) {
        router.push(`/listing/${content.listing.id}`);
      }
    } else if (notification.type === NotificationType.MESSAGE) {
      const content = notification.content as MessageContent;
      router.push(`/chat/${content.conversation_id}`);
    } else if (notification.type === NotificationType.NEW_FOLLOWER) {
      const content = notification.content as FollowerContent;
      router.push(`/profile/${content.follower.username}`);
    }
  };

  return (
    <XStack
      gap="$3"
      alignItems="center"
      elevation={notification.seen ? 0 : 1}
      borderRadius="$5"
      padding="$2"
      pressStyle={{ scale: 0.99, opacity: 0.8 }}
      onPress={handlePress}
      backgroundColor={notification.seen ? undefined : "$muted"}
    >
      {/* Left side - Image */}
      {getImageContent()}

      {/* Right side - Content */}
      <YStack flex={1} gap="$1.5" px="$1">
        <XStack alignItems="center" justifyContent="space-between">
          <Text
            fontSize="$5"
            fontWeight={"500"}
            color="$foreground"
            numberOfLines={1}
          >
            {notification.title}
          </Text>

          <Text fontSize="$3" color="$mutedForeground">
            {formatDate(notification.created_at)}
          </Text>
        </XStack>

        <Text
          fontSize="$3"
          color="$mutedForeground"
          numberOfLines={2}
          lineHeight="$1"
          fontWeight="400"
        >
          {notification.body}
        </Text>
      </YStack>
    </XStack>
  );
}
