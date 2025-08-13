import { useUserFavorites } from "./queries/use-listing";

/**
 * Simple hook to check if a listing is favorited
 * Uses only the favorites list - no detailed listing calls
 */
export function useIsFavorited(listingId: string) {
  const { data: favorites, isLoading, error } = useUserFavorites();

  // Ensure favorites is always an array and listingId is valid
  const isFavorited = Array.isArray(favorites) && listingId 
    ? favorites.some((favorite) => favorite?.id === listingId) 
    : false;

  return {
    isFavorited,
    isLoading,
    error,
  };
}