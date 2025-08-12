import { FilterParameter } from "@bid-scents/shared-sdk";

export const getActiveFiltersCount = (filters: FilterParameter): number => {
  let count = 0;
  if (filters.listing_types?.length) count++;
  if (filters.categories?.length) count++;
  if (filters.min_price || filters.max_price) count++;
  if (filters.min_purchase_year || filters.max_purchase_year) count++;
  if (filters.box_conditions?.length) count++;
  return count;
};

export const createClearedFilters = (): FilterParameter => ({
  listing_types: null,
  categories: null,
  min_price: null,
  max_price: null,
  min_purchase_year: null,
  max_purchase_year: null,
  box_conditions: null,
  seller_ids: null,
});