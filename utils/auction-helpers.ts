import { AuctionDetails } from '@bid-scents/shared-sdk'

/**
 * Checks if the current user is the highest bidder in an auction
 */
export function isCurrentUserHighestBidder(
  auctionDetails: AuctionDetails | null | undefined,
  currentUserId: string | undefined
): boolean {
  if (!auctionDetails?.bids || auctionDetails.bids.length === 0 || !currentUserId) {
    return false
  }

  const highestBidder = auctionDetails.bids[0].bidder
  return highestBidder?.id === currentUserId
}

/**
 * Gets the highest bidder from auction details
 */
export function getHighestBidder(auctionDetails: AuctionDetails | null | undefined) {
  if (!auctionDetails?.bids || auctionDetails.bids.length === 0) {
    return null
  }
  
  return auctionDetails.bids[0].bidder
}