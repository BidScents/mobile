import { ListingService, SearchRequest, SearchResponse } from "@bid-scents/shared-sdk";
import { useInfiniteQuery } from "@tanstack/react-query";
import { queryKeys } from "./query-keys";

/**
 * Search listings with infinite scroll support
 * Used for main search functionality and filtered results
 */
export function useSearchListings(searchParams: SearchRequest) {
  return useInfiniteQuery({
    queryKey: queryKeys.listings.search(searchParams),
    queryFn: ({ pageParam = 1 }) => {
      const requestWithPage = {
        ...searchParams,
        page: pageParam,
        per_page: searchParams.per_page || 20,
      };

      return ListingService.searchListingsV1ListingSearchPost(requestWithPage);
    },
    getNextPageParam: (lastPage: SearchResponse) => {
      const { page, total_pages } = lastPage.pagination_data;
      return page < total_pages ? page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 2 * 60 * 1000, // 2 minutes - search results change frequently
    // Prevent aggressive refetching for search results
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    // Enable query for:
    // 1. Search with query text
    // 2. Filter-only search (empty query but has filters)
    // 3. Empty search to return all listings (no query and no filters)
    enabled: true,
  });
}