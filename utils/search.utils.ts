import { FilterParameter } from '@bid-scents/shared-sdk';

/**
 * Creates an empty filter state for search functionality
 */
export const createEmptyFilters = (): FilterParameter => ({
  listing_types: null,
  categories: null,
  min_price: null,
  max_price: null,
  min_purchase_year: null,
  max_purchase_year: null,
  box_conditions: null,
  seller_ids: null,
});

/**
 * Counts the number of active filters in a filter parameter object
 */
export const getActiveFiltersCount = (filters: FilterParameter): number => {
  let count = 0;
  if (filters.listing_types?.length) count++;
  if (filters.categories?.length) count++;
  if (filters.min_price || filters.max_price) count++;
  if (filters.min_purchase_year || filters.max_purchase_year) count++;
  if (filters.box_conditions?.length) count++;
  return count;
};

/**
 * Checks if any filters are currently active
 */
export const hasActiveFilters = (filters: FilterParameter): boolean => {
  return getActiveFiltersCount(filters) > 0;
};

/**
 * Checks if a search has any meaningful criteria (query or filters)
 */
export const hasSearchCriteria = (query: string, filters: FilterParameter): boolean => {
  const hasQuery = query && query.trim().length > 0;
  const hasFilters = hasActiveFilters(filters);
  return hasQuery || hasFilters;
};