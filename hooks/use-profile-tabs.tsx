import React, { useMemo } from 'react';
import { ProfileContentTab } from '@/components/profile/profile-content-tab';
import { ListingSearchRequest, ReviewSearchRequest } from '@bid-scents/shared-sdk';

interface UseProfileTabsProps {
  flattenedData: {
    active: any[];
    featured: any[];
    sold: any[];
    reviews: any[];
  };
  loadingStates: {
    activeListingsLoading: boolean;
    featuredListingsLoading: boolean;
    soldListingsLoading: boolean;
    reviewsLoading: boolean;
  };
  fetchingStates: {
    activeListingsFetchingNext: boolean;
    featuredListingsFetchingNext: boolean;
    soldListingsFetchingNext: boolean;
    reviewsFetchingNext: boolean;
  };
  hasNextStates: {
    activeListingsHasNext: boolean;
    featuredListingsHasNext: boolean;
    soldListingsHasNext: boolean;
    reviewsHasNext: boolean;
  };
  fetchNextFunctions: {
    fetchNextActiveListings: () => void;
    fetchNextFeaturedListings: () => void;
    fetchNextSoldListings: () => void;
    fetchNextReviews: () => void;
  };
  sortHandlers: {
    handleListingSortChange: (tab: 'active' | 'featured' | 'sold', params: Partial<ListingSearchRequest>) => void;
    handleReviewSortChange: (params: Partial<ReviewSearchRequest>) => void;
  };
  currentSortValues: Record<string, string>;
}

const MemoizedProfileContentTab = React.memo(ProfileContentTab);

export const useProfileTabs = ({
  flattenedData,
  loadingStates,
  fetchingStates,
  hasNextStates,
  fetchNextFunctions,
  sortHandlers,
  currentSortValues,
}: UseProfileTabsProps) => {
  const tabsConfig = useMemo(() => [
    {
      key: "active",
      title: "Active",
      content: (
        <MemoizedProfileContentTab
          contentType="active"
          data={flattenedData.active}
          isLoading={loadingStates.activeListingsLoading}
          isFetchingNextPage={fetchingStates.activeListingsFetchingNext}
          hasNextPage={hasNextStates.activeListingsHasNext}
          onLoadMore={fetchNextFunctions.fetchNextActiveListings}
          onSortChange={(params) => sortHandlers.handleListingSortChange('active', params as Partial<ListingSearchRequest>)}
          currentSort={currentSortValues.active}
        />
      ),
    },
    {
      key: "featured",
      title: "Featured",
      content: (
        <MemoizedProfileContentTab
          contentType="featured"
          data={flattenedData.featured}
          isLoading={loadingStates.featuredListingsLoading}
          isFetchingNextPage={fetchingStates.featuredListingsFetchingNext}
          hasNextPage={hasNextStates.featuredListingsHasNext}
          onLoadMore={fetchNextFunctions.fetchNextFeaturedListings}
          onSortChange={(params) => sortHandlers.handleListingSortChange('featured', params as Partial<ListingSearchRequest>)}
          currentSort={currentSortValues.featured}
        />
      ),
    },
    {
      key: "sold",
      title: "Sold",
      content: (
        <MemoizedProfileContentTab
          contentType="sold"
          data={flattenedData.sold}
          isLoading={loadingStates.soldListingsLoading}
          isFetchingNextPage={fetchingStates.soldListingsFetchingNext}
          hasNextPage={hasNextStates.soldListingsHasNext}
          onLoadMore={fetchNextFunctions.fetchNextSoldListings}
          onSortChange={(params) => sortHandlers.handleListingSortChange('sold', params as Partial<ListingSearchRequest>)}
          currentSort={currentSortValues.sold}
        />
      ),
    },
    {
      key: "reviews",
      title: "Reviews",
      content: (
        <MemoizedProfileContentTab
          contentType="reviews"
          data={flattenedData.reviews}
          isLoading={loadingStates.reviewsLoading}
          isFetchingNextPage={fetchingStates.reviewsFetchingNext}
          hasNextPage={hasNextStates.reviewsHasNext}
          onLoadMore={fetchNextFunctions.fetchNextReviews}
          onSortChange={(params) => sortHandlers.handleReviewSortChange(params as Partial<ReviewSearchRequest>)}
          currentSort={currentSortValues.reviews}
        />
      ),
    },
  ], [
    flattenedData,
    loadingStates,
    fetchingStates,
    hasNextStates,
    fetchNextFunctions,
    sortHandlers,
    currentSortValues,
  ]);

  return { tabsConfig };
};
