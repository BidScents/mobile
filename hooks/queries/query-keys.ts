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
    sellersYouFollow: () => ['listings', 'sellers-you-follow'] as const,
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
    followers: (userId: string) => 
      ['profile', 'followers', userId] as const,
    following: (userId: string) => 
      ['profile', 'following', userId] as const,
  },
  
  messages: {
    all: ['messages'] as const,
    summary: ['messages', 'summary'] as const,
    conversation: (id: string) => ['messages', 'conversation', id] as const,
    list: (conversationId: string) => ['messages', 'list', conversationId] as const,
  },
  
  dashboard: {
    all: ['dashboard'] as const,
    user: (userId: string) => ['dashboard', 'user', userId] as const,
    auctions: ['dashboard', 'auctions'] as const,
    settlement: (listingId: string) => ['dashboard', 'settlement', listingId] as const,
    transactions: ['dashboard', 'transactions'] as const,
    listings: {
      all: ['dashboard', 'listings'] as const,
      active: ['dashboard', 'listings', 'active'] as const,
      featured: ['dashboard', 'listings', 'featured'] as const,
    }
  },
  
  notifications: {
    all: ['notifications'] as const,
    list: () => ['notifications', 'list'] as const,
    preferences: ['notifications', 'preferences'] as const,
  },
  
  payments: {
    all: ['payments'] as const,
    paymentMethod: ['payments', 'payment-method'] as const,
    products: ['payments', 'products'] as const,
  },
} as const