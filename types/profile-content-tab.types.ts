import type { ListingCard as ListingCardType, ListingSearchRequest, ReviewSearchRequest } from '@bid-scents/shared-sdk';

export type ContentType = 'active' | 'featured' | 'sold' | 'reviews';

export interface Review {
  id?: string;
  reviewer_name?: string;
  rating?: number;
  content?: string;
  comment?: string;
  created_at?: string;
  review_id?: string;
}

export interface ProfileContentTabProps {
  contentType: ContentType;
  data?: ListingCardType[] | Review[];
  isLoading?: boolean;
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
  onLoadMore?: () => void;
  onSortChange?: (sortParams: Partial<ListingSearchRequest> | Partial<ReviewSearchRequest>) => void;
  currentSort?: string;
}

export interface SortOption {
  label: string;
  value: string;
  sortParams: Partial<ListingSearchRequest> | Partial<ReviewSearchRequest>;
}

export interface EmptyState {
  title: string;
  description: string;
}
