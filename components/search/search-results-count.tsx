import React from "react";
import { Text, XStack } from "tamagui";

interface SearchResultsCountProps {
  totalFound: number;
  isLoading: boolean;
  hasError: boolean;
}

/**
 * Displays the search results count with loading and error states
 */
export const SearchResultsCount: React.FC<SearchResultsCountProps> = ({
  totalFound,
  isLoading,
  hasError,
}) => {
  return (
    <XStack alignItems="center">
      {isLoading ? (
        <Text fontSize="$4" fontWeight="500" color="$mutedForeground">
          Loading...
        </Text>
      ) : hasError ? (
        <Text fontSize="$4" fontWeight="500" color="$red10">
          Error loading results
        </Text>
      ) : (
        <Text fontSize="$4" fontWeight="500" color="$mutedForeground">
          {totalFound} {totalFound === 1 ? 'result' : 'results'}
        </Text>
      )}
    </XStack>
  );
};