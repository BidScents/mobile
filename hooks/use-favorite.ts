import { useListingDetail, useUserFavorites } from "./queries/use-listing";

/**
 * Custom hook to check if a specific listing is favorited by the current user
 * Derives the favorite status from the user's favorites list
 */
export function useIsFavorited(listingId: string) {
  const { data: favorites, isLoading } = useUserFavorites();

  // Check if the listing exists in the favorites array
  const isFavorited =
    favorites?.some((favorite) => favorite.id === listingId) ?? false;

  return {
    isFavorited,
    isLoading, // Pass through loading state so components can handle it
  };
}

/**
 * Enhanced hook that provides both favorite status and count
 * Prioritizes listing detail cache for count, falls back to favorites list
 */
export function useFavoriteStatus(listingId: string, initialCount?: number) {
  const { isFavorited, isLoading: favoritesLoading } =
    useIsFavorited(listingId);
  const { data: listingDetail, isLoading: listingLoading } =
    useListingDetail(listingId);

  // Prioritize count from listing detail cache (most up-to-date)
  // Fall back to favorites list, then initial count
  const favoritesCount = listingDetail?.favorites_count ?? initialCount ?? 0;

  return {
    isFavorited,
    favoritesCount,
    isLoading: favoritesLoading || listingLoading,
  };
}
