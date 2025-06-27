import { ListingCard } from '@bid-scents/shared-sdk'

export interface CardProps {
  listing: ListingCard
  onPress?: () => void
  onFavorite?: (listingId: string, isFavorited: boolean) => void
}