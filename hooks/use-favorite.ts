import { useUserFavorites } from "./queries/use-listing";

/**
 * Simple hook to check if a listing is favorited
 * Uses only the favorites list - no detailed listing calls
 */
export function useIsFavorited(listingId: string) {
  const { data: favorites, isLoading } = useUserFavorites();

  const isFavorited = favorites?.some((favorite) => favorite.id === listingId) ?? false;

  return {
    isFavorited,
    isLoading,
  };
}