import type { ListingCard as ListingCardType } from '@bid-scents/shared-sdk';
import { LISTING_SORT_OPTIONS, REVIEW_SORT_OPTIONS } from '../constants/profile-content-tab.constants';
import type { ContentType, Review, SortOption } from '../types/profile-content-tab.types';

// Type guard functions
export function isListingData(data: ListingCardType[] | Review[], contentType: ContentType): data is ListingCardType[] {
  return ['active', 'featured', 'sold'].includes(contentType);
}

export function isReviewData(data: ListingCardType[] | Review[], contentType: ContentType): data is Review[] {
  return contentType === 'reviews';
}

// Sort utilities
export function getSortOptions(contentType: ContentType): SortOption[] {
  return isListingData([], contentType) ? LISTING_SORT_OPTIONS : REVIEW_SORT_OPTIONS;
}

export function getCurrentSortLabel(sortOptions: SortOption[], currentSort: string): string {
  const currentOption = sortOptions.find(option => option.value === currentSort);
  return currentOption?.label || 'Sort';
}

// Key extractors
export function listingKeyExtractor(item: ListingCardType, index: number): string {
  return item.id || `listing-${index}`;
}

export function reviewKeyExtractor(item: Review, index: number): string {
  return item.review_id || item.id || `review-${index}`;
}
