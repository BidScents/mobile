import {
  ListingSearchRequest,
  ProfileTab,
  ReviewSearchRequest,
  SearchRequest
} from "@bid-scents/shared-sdk";

export const queryKeys = {
  homepage: ['homepage'] as const,
  
  listings: {
    all: ['listings'] as const,
    detail: (id: string) => ['listings', 'detail', id] as const,
    search: (params: SearchRequest) => ['listings', 'search', params] as const,
    infiniteSearch: (params: SearchRequest) => ['listings', 'infinite-search', params] as const,
    favorites: ['listings', 'favorites'] as const,
    comments: (listingId: string) => ['listings', 'comments', listingId] as const,
    votes: (listingId: string) => ['listings', 'votes', listingId] as const,
  },
  
  profile: {
    all: ['profile'] as const,
    detail: (userId: string) => ['profile', 'detail', userId] as const,
    preview: (userId: string) => ['profile', 'preview', userId] as const,
    listings: (userId: string, tab: ProfileTab, filters?: ListingSearchRequest) => 
      ['profile', 'listings', userId, tab, filters] as const,
    reviews: (userId: string, filters?: ReviewSearchRequest) => 
      ['profile', 'reviews', userId, filters] as const,
  },
  
  user: {
    profile: (username: string) => ['user', 'profile', username] as const,
    own: ['user', 'own'] as const,
  },
  
  messages: {
    all: ['messages'] as const,
    conversation: (id: string) => ['messages', 'conversation', id] as const,
  },
  
  dashboard: {
    all: ['dashboard'] as const,
    user: (userId: string) => ['dashboard', 'user', userId] as const,
    listings: {
      all: ['dashboard', 'listings'] as const,
      active: ['dashboard', 'listings', 'active'] as const,
      sold: ['dashboard', 'listings', 'sold'] as const,
      draft: ['dashboard', 'listings', 'draft'] as const,
    }
  },
  
  notifications: {
    all: ['notifications'] as const,
    list: (cursor?: string, limit?: number) => ['notifications', 'list', cursor, limit] as const,
    preferences: ['notifications', 'preferences'] as const,
  }
} as const