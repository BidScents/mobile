import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import { QueryClient } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import React from 'react'
import { MMKV } from 'react-native-mmkv'

// Create MMKV storage instance for React Query cache persistence
const storage = new MMKV({
  id: 'react-query-cache',
})

// Create persister that bridges React Query with MMKV storage
const asyncStoragePersister = createAsyncStoragePersister({
  storage: {
    setItem: (key, value) => {
      storage.set(key, value)
      return Promise.resolve()
    },
    getItem: (key) => {
      const value = storage.getString(key)
      return Promise.resolve(value ?? null)
    },
    removeItem: (key) => {
      storage.delete(key)
      return Promise.resolve()
    },
  },
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
 * Provides React Query functionality with persistent caching using MMKV.
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