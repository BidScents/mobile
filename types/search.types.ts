import { ListingSortField } from '@bid-scents/shared-sdk';

/**
 * Search-specific sort option interface
 * Only uses ListingSortField (no ReviewSortField)
 */
export interface SearchSortOption {
  label: string;
  value: string;
  sort: ListingSortField;
  descending: boolean;
}

/**
 * Search result data interface for communication between components
 */
export interface SearchResultsData {
  totalFound: number;
  isLoading: boolean;
  hasError: boolean;
}