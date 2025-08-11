import { ListingSortField } from '@bid-scents/shared-sdk';
import type { SearchSortOption } from '../types/search.types';

/**
 * Search-specific sort options
 * Only uses ListingSortField for search functionality
 */
export const SEARCH_SORT_OPTIONS: SearchSortOption[] = [
  { 
    label: 'Newest First', 
    value: 'newest', 
    sort: ListingSortField.CREATED_AT, 
    descending: true 
  },
  { 
    label: 'Oldest First', 
    value: 'oldest', 
    sort: ListingSortField.CREATED_AT, 
    descending: false 
  },
  { 
    label: 'Price: Low to High', 
    value: 'price_asc', 
    sort: ListingSortField.PRICE, 
    descending: false 
  },
  { 
    label: 'Price: High to Low', 
    value: 'price_desc', 
    sort: ListingSortField.PRICE, 
    descending: true 
  },
];