import { ListingSortField, ReviewSortField } from '@bid-scents/shared-sdk';
import type { ContentType, EmptyState, SortOption } from '../types/profile-content-tab.types';

export const EMPTY_STATES: Record<ContentType, EmptyState> = {
  active: {
    title: 'No Active Listings',
    description: "This user doesn't have any active listings yet."
  },
  featured: {
    title: 'No Featured Listings', 
    description: "This user doesn't have any featured listings."
  },
  sold: {
    title: 'No Sold Listings',
    description: "This user hasn't sold any items yet."
  },
  reviews: {
    title: 'No Reviews Yet',
    description: "This user hasn't received any reviews yet."
  }
};

export const LISTING_SORT_OPTIONS: SortOption[] = [
  { label: 'Newest First', value: 'newest', sortParams: { sort: ListingSortField.CREATED_AT, descending: true } },
  { label: 'Oldest First', value: 'oldest', sortParams: { sort: ListingSortField.CREATED_AT, descending: false } },
  { label: 'Price: Low to High', value: 'price_asc', sortParams: { sort: ListingSortField.PRICE, descending: false } },
  { label: 'Price: High to Low', value: 'price_desc', sortParams: { sort: ListingSortField.PRICE, descending: true } },
];

export const REVIEW_SORT_OPTIONS: SortOption[] = [
  { label: 'Newest First', value: 'newest', sortParams: { sort: ReviewSortField.CREATED_AT, descending: true } },
  { label: 'Oldest First', value: 'oldest', sortParams: { sort: ReviewSortField.CREATED_AT, descending: false } },
  { label: 'Highest Rated', value: 'rating_desc', sortParams: { sort: ReviewSortField.RATING, descending: true } },
  { label: 'Lowest Rated', value: 'rating_asc', sortParams: { sort: ReviewSortField.RATING, descending: false } },
];
