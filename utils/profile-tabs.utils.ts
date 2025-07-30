import type { ListingSearchRequest, ReviewSearchRequest } from '@bid-scents/shared-sdk';

export interface TabConfig {
  key: 'active' | 'featured' | 'sold' | 'reviews';
  title: string;
  content: React.ReactNode;
}

export function createTabsConfig(
  activeContent: React.ReactNode,
  featuredContent: React.ReactNode,
  soldContent: React.ReactNode,
  reviewsContent: React.ReactNode
): TabConfig[] {
  return [
    {
      key: 'active',
      title: 'Active',
      content: activeContent,
    },
    {
      key: 'featured', 
      title: 'Featured',
      content: featuredContent,
    },
    {
      key: 'sold',
      title: 'Sold',
      content: soldContent,
    },
    {
      key: 'reviews',
      title: 'Reviews',
      content: reviewsContent,
    },
  ];
}

export function createTabContentHandlers(
  updateListingSort: (tab: 'active' | 'featured' | 'sold', sortParams: Partial<ListingSearchRequest>) => void,
  updateReviewSort: (sortParams: Partial<ReviewSearchRequest>) => void,
  fetchNextActiveListings: () => void,
  fetchNextFeaturedListings: () => void,
  fetchNextSoldListings: () => void,
  fetchNextReviews: () => void
) {
  return {
    handleActiveSort: (sortParams: Partial<ListingSearchRequest>) => updateListingSort('active', sortParams),
    handleFeaturedSort: (sortParams: Partial<ListingSearchRequest>) => updateListingSort('featured', sortParams),
    handleSoldSort: (sortParams: Partial<ListingSearchRequest>) => updateListingSort('sold', sortParams),
    handleReviewSort: (sortParams: Partial<ReviewSearchRequest>) => updateReviewSort(sortParams),
    
    handleActiveLoadMore: fetchNextActiveListings,
    handleFeaturedLoadMore: fetchNextFeaturedListings,
    handleSoldLoadMore: fetchNextSoldListings,
    handleReviewLoadMore: fetchNextReviews,
  };
}
