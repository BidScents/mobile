import { SEARCH_SORT_OPTIONS } from '@/constants/search.constants';
import type { SearchResultsData } from '@/types/search.types';
import { createEmptyFilters, getActiveFiltersCount } from '@/utils/search.utils';
import { FilterParameter, SearchRequest, SortParameter } from '@bid-scents/shared-sdk';
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';

/**
 * Hook to manage search results page state and logic
 */
export const useSearchResults = () => {
  const params = useLocalSearchParams();

  // Parse URL parameters
  const searchQuery = (params.q as string) || '';
  
  const initialFilters: FilterParameter = useMemo(() => {
    try {
      return params.filters ? JSON.parse(params.filters as string) : createEmptyFilters();
    } catch {
      return createEmptyFilters();
    }
  }, [params.filters]);

  const initialSort: SortParameter = useMemo(() => {
    try {
      return params.sort ? JSON.parse(params.sort as string) : { field: undefined, descending: true };
    } catch {
      return { field: undefined, descending: true };
    }
  }, [params.sort]);

  // Local state
  const [filters, setFilters] = useState<FilterParameter>(initialFilters);
  const [sort, setSort] = useState<SortParameter>(initialSort);
  const [currentSearchQuery, setCurrentSearchQuery] = useState(searchQuery);
  const [confirmedSearchQuery, setConfirmedSearchQuery] = useState(searchQuery);
  const [resultsData, setResultsData] = useState<SearchResultsData>({ 
    totalFound: 0, 
    isLoading: true, 
    hasError: false 
  });
  
  const [currentSortLabel, setCurrentSortLabel] = useState(() => {
    const sortOption = SEARCH_SORT_OPTIONS.find(option => 
      option.sort === sort.field && 
      option.descending === sort.descending
    );
    return sortOption?.label || 'Newest First';
  });

  // Build search parameters
  const searchParams: SearchRequest = useMemo(() => ({
    q: confirmedSearchQuery,
    filters: filters,
    sort: sort,
    per_page: 20,
  }), [confirmedSearchQuery, filters, sort]);

  // Handle sort selection
  const handleSortSelect = useCallback((value: string) => {
    const selectedOption = SEARCH_SORT_OPTIONS.find(option => option.value === value);
    if (selectedOption) {
      setSort({ field: selectedOption.sort, descending: selectedOption.descending });
      setCurrentSortLabel(selectedOption.label);
    }
  }, []);

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: FilterParameter) => {
    setFilters(newFilters);
  }, []);

  // Handle search changes (text input only - no search execution)
  const handleSearchChange = useCallback((query: string) => {
    setCurrentSearchQuery(query);
  }, []);

  // Handle search submission (actually execute the search)
  const handleSearchSubmit = useCallback((query: string) => {
    setConfirmedSearchQuery(query);
  }, []);

  // Handle data changes from SearchResultsList
  const handleDataChange = useCallback((data: SearchResultsData) => {
    setResultsData(data);
  }, []);

  return {
    // Search parameters
    searchParams,
    currentSearchQuery,
    confirmedSearchQuery,
    filters,
    sort,
    currentSortLabel,
    resultsData,
    
    // Handlers
    handleSortSelect,
    handleFiltersChange,
    handleSearchChange,
    handleSearchSubmit,
    handleDataChange,
    
    // Utilities
    activeFiltersCount: getActiveFiltersCount(filters),
  };
};