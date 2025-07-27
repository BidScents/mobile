import { ListingSearchRequest, ProfileTab, ReviewSearchRequest } from "@bid-scents/shared-sdk";

export const queryKeys = {
    homepage: ['homepage'] as const,
    listings: {
      all: ['listings'] as const,
      detail: (id: string) => ['listings', 'detail', id] as const,
      search: (params: any) => ['listings', 'search', params] as const,
      favorites: ['listings', 'favorites'] as const,
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
    }
  } as const