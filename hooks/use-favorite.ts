import { useMemo } from "react";
import { useUserFavorites } from "./queries/use-listing";

/**
 * Simple hook to check if a listing is favorited
 * Uses only the favorites list - no detailed listing calls
 * Includes better handling for loading states and race conditions
 */
export function useIsFavorited(listingId: string) {
  const { data: favorites, isLoading, error, isFetching } = useUserFavorites();

  // Memoize the favorite status calculation to prevent unnecessary recalculations
  const isFavorited = useMemo(() => {
    if (!listingId) return false;
    if (!Array.isArray(favorites)) return false;
    return favorites.some((favorite) => favorite?.id === listingId);
  }, [favorites, listingId]);

  return {
    isFavorited,
    isLoading: isLoading && !favorites, // Only show loading if we don't have any cached data
    isFetching,
    error,
  };
}