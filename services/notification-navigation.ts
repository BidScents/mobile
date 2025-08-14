import type {
  AuctionExpiryContent,
  CommentContent,
  FollowedSellerListingContent,
  FollowerContent,
  ListingContent,
  MessageContent,
  NotificationType,
  OutbidContent
} from '@bid-scents/shared-sdk';
import { router } from 'expo-router';


/**
 * Handle navigation based on notification data
 * 
 * @param data - Notification data from the push notification
 */
export function handleNotificationNavigation(data: any): void {
  if (!data || !data.type) {
    console.log('No navigation data found, going to notifications page');
    router.push('/(tabs)/notifications');
    return;
  }

  console.log('Handling notification navigation:', data.type, data);

  try {
    switch (data.type as NotificationType) {
      case 'listing_favorited':
      case 'favorite_listing_edited':
      case 'listing_bid':
      case 'auction_extension':
        handleListingNavigation(data.content as ListingContent);
        break;

      case 'outbid':
        handleOutbidNavigation(data.content as OutbidContent);
        break;

      case 'auction_expiry':
        handleAuctionExpiryNavigation(data.content as AuctionExpiryContent);
        break;

      case 'new_follower':
        handleFollowerNavigation(data.content as FollowerContent);
        break;

      case 'followed_seller_listing':
        handleFollowedSellerListingNavigation(data.content as FollowedSellerListingContent);
        break;

      case 'listing_comment':
        handleCommentNavigation(data.content as CommentContent);
        break;

      case 'message':
        handleMessageNavigation(data.content as MessageContent);
        break;

      case 'payment_made':
      case 'receipt_confirmed':
        // Navigate to orders/transactions page
        router.push('/(tabs)/profile/orders');
        break;

      case 'override':
      default:
        // Fallback to notifications page
        router.push('/(tabs)/notifications');
        break;
    }
  } catch (error) {
    console.error('Error handling notification navigation:', error);
    // Fallback to notifications page on error
    router.push('/(tabs)/notifications');
  }
}

/**
 * Navigate to listing detail page
 */
function handleListingNavigation(content: ListingContent): void {
  if (content?.listing?.id) {
    router.push(`/listing/${content.listing.id}`);
  } else {
    router.push('/(tabs)/notifications');
  }
}

/**
 * Navigate to listing where user was outbid
 */
function handleOutbidNavigation(content: OutbidContent): void {
  if (content?.listing?.id) {
    router.push(`/listing/${content.listing.id}`);
  } else {
    router.push('/(tabs)/notifications');
  }
}

/**
 * Navigate to expired auction listing
 */
function handleAuctionExpiryNavigation(content: AuctionExpiryContent): void {
  if (content?.listing?.id) {
    router.push(`/listing/${content.listing.id}`);
  } else {
    router.push('/(tabs)/notifications');
  }
}

/**
 * Navigate to new follower's profile
 */
function handleFollowerNavigation(content: FollowerContent): void {
  if (content?.follower?.id) {
    router.push(`/(tabs)/profile/${content.follower.id}`);
  } else {
    router.push('/(tabs)/notifications');
  }
}

/**
 * Navigate to listing from followed seller
 */
function handleFollowedSellerListingNavigation(content: FollowedSellerListingContent): void {
  if (content?.listing?.id) {
    router.push(`/listing/${content.listing.id}`);
  } else {
    router.push('/(tabs)/notifications');
  }
}

/**
 * Navigate to listing with new comment
 */
function handleCommentNavigation(content: CommentContent): void {
  if (content?.listing?.id) {
    router.push(`/listing/${content.listing.id}`);
  } else {
    router.push('/(tabs)/notifications');
  }
}

/**
 * Navigate to message conversation
 */
function handleMessageNavigation(content: MessageContent): void {
  if (content?.conversation_id) {
    // TODO: Update this route when chat functionality is implemented
    // router.push(`/chat/${content.conversation_id}`);
    console.log('Navigate to chat:', content.conversation_id);
    router.push('/(tabs)/chat');
  } else {
    router.push('/(tabs)/notifications');
  }
}