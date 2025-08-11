import { FilterParameter, SortParameter } from '@bid-scents/shared-sdk';
import { useState, useCallback } from 'react';
import { createEmptyFilters } from '../utils/search.utils';

interface UseSearchStateReturn {
  filters: FilterParameter;
  sort: SortParameter;
  updateFilters: (newFilters: FilterParameter) => void;
  updateSort: (newSort: SortParameter) => void;
  resetFilters: () => void;
  resetSort: () => void;
  resetAll: () => void;
}

/**
 * Hook to manage search filters and sort state
 */
export const useSearchState = (
  initialFilters?: FilterParameter,
  initialSort?: SortParameter
): UseSearchStateReturn => {
  const [filters, setFilters] = useState<FilterParameter>(
    initialFilters || createEmptyFilters()
  );
  
  const [sort, setSort] = useState<SortParameter>(
    initialSort || { field: undefined, descending: true }
  );

  const updateFilters = useCallback((newFilters: FilterParameter) => {
    setFilters(newFilters);
  }, []);

  const updateSort = useCallback((newSort: SortParameter) => {
    setSort(newSort);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(createEmptyFilters());
  }, []);

  const resetSort = useCallback(() => {
    setSort({ field: undefined, descending: true });
  }, []);

  const resetAll = useCallback(() => {
    resetFilters();
    resetSort();
  }, [resetFilters, resetSort]);

  return {
    filters,
    sort,
    updateFilters,
    updateSort,
    resetFilters,
    resetSort,
    resetAll,
  };
};