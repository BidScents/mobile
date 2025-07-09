export const queryKeys = {
    homepage: ['homepage'] as const,
    listings: {
      all: ['listings'] as const,
      detail: (id: string) => ['listings', 'detail', id] as const,
      search: (params: any) => ['listings', 'search', params] as const,
      favorites: ['listings', 'favorites'] as const,
    },
    user: {
      profile: (username: string) => ['user', 'profile', username] as const,
      own: ['user', 'own'] as const,
    },
    messages: {
      all: ['messages'] as const,
      conversation: (id: string) => ['messages', 'conversation', id] as const,
    },
  } as const