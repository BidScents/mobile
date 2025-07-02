import AsyncStorage from '@react-native-async-storage/async-storage'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import { QueryClient } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import React from 'react'

// Create persister using AsyncStorage - React Query handles the interface automatically
const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
})

/**
 * Creates a React Query client optimized for marketplace data patterns.
 * Configured with reasonable defaults for user-generated content and real-time updates.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes - good for listings
      gcTime: 10 * 60 * 1000, // Keep in memory for 10 minutes after last use
      retry: 2, // Retry failed requests twice (network issues)
      refetchOnWindowFocus: false, // Don't refetch when app regains focus
      refetchOnReconnect: true, // Do refetch when internet reconnects
    },
    mutations: {
      retry: 1, // Only retry mutations once to avoid duplicate actions
    },
  },
})

interface QueryProviderProps {
  children: React.ReactNode
}

/**
 * Provides React Query functionality with persistent caching using AsyncStorage.
 * This ensures cached data (user profiles, listings) persists between app sessions.
 * 
 * @param children - React components that need access to React Query
 */
export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: asyncStoragePersister }}
    >
      {children}
    </PersistQueryClientProvider>
  )
}