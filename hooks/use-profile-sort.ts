import { useState } from 'react';
import { ListingSearchRequest, ListingSortField, ReviewSearchRequest, ReviewSortField } from '@bid-scents/shared-sdk';

const DEFAULT_LISTING_SORT: Partial<ListingSearchRequest> = {
  sort: ListingSortField.CREATED_AT,
  descending: true,
};

const DEFAULT_REVIEW_SORT: Partial<ReviewSearchRequest> = {
  sort: ReviewSortField.CREATED_AT,
  descending: true,
};

export function useProfileSort() {
  // Sort state management
  const [listingSortParams, setListingSortParams] = useState<Record<string, Partial<ListingSearchRequest>>>({
    active: DEFAULT_LISTING_SORT,
    featured: DEFAULT_LISTING_SORT,
    sold: DEFAULT_LISTING_SORT,
  });
  
  const [reviewSortParams, setReviewSortParams] = useState<Partial<ReviewSearchRequest>>(DEFAULT_REVIEW_SORT);

  // Sort tracking for UI (maps sort params back to option values)
  const [currentSortValues, setCurrentSortValues] = useState<Record<string, string>>({
    active: 'newest',
    featured: 'newest',
    sold: 'newest',
    reviews: 'newest',
  });

  // Helper function to map sort params to UI values
  const getSortValue = (sortParams: Partial<ListingSearchRequest> | Partial<ReviewSearchRequest>): string => {
    if (!sortParams.sort) return 'newest';
    
    const { sort, descending } = sortParams;
    
    // Handle listing sorts
    if (sort === ListingSortField.CREATED_AT) {
      return descending ? 'newest' : 'oldest';
    }
    if (sort === ListingSortField.PRICE) {
      return descending ? 'price_desc' : 'price_asc';
    }
    
    // Handle review sorts
    if (sort === ReviewSortField.CREATED_AT) {
      return descending ? 'newest' : 'oldest';
    }
    if (sort === ReviewSortField.RATING) {
      return descending ? 'rating_desc' : 'rating_asc';
    }
    
    return 'newest';
  };

  const updateListingSort = (tab: 'active' | 'featured' | 'sold', sortParams: Partial<ListingSearchRequest>) => {
    setListingSortParams(prev => ({
      ...prev,
      [tab]: sortParams
    }));
    setCurrentSortValues(prev => ({
      ...prev,
      [tab]: getSortValue(sortParams)
    }));
  };

  const updateReviewSort = (sortParams: Partial<ReviewSearchRequest>) => {
    setReviewSortParams(sortParams);
    setCurrentSortValues(prev => ({
      ...prev,
      reviews: getSortValue(sortParams)
    }));
  };

  return {
    listingSortParams,
    reviewSortParams,
    currentSortValues,
    updateListingSort,
    updateReviewSort,
  };
}
