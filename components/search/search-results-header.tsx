import { SearchBar } from "@/components/ui/search-bar";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { XStack, YStack, useTheme } from "tamagui";
import { SearchFilterButton } from "./search-filter-button";
import { SearchResultsCount } from "./search-results-count";
import { SearchSortButton } from "./search-sort-button";

interface SearchResultsHeaderProps {
  // Search bar props
  currentSearchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit: (query: string) => void;
  
  // Back button
  onBackPress: () => void;
  
  // Results count
  totalFound: number;
  isLoading: boolean;
  hasError: boolean;
  
  // Filter button
  activeFiltersCount: number;
  onFilterPress: () => void;
  
  // Sort button
  currentSortLabel: string;
  onSortPress: () => void;
}

/**
 * Complete header component for search results page including:
 * - Back button and search bar
 * - Results count, filter and sort controls
 */
export const SearchResultsHeader: React.FC<SearchResultsHeaderProps> = ({
  currentSearchQuery,
  onSearchChange,
  onSearchSubmit,
  onBackPress,
  totalFound,
  isLoading,
  hasError,
  activeFiltersCount,
  onFilterPress,
  currentSortLabel,
  onSortPress,
}) => {
  const theme = useTheme();

  return (
    <YStack gap="$3" paddingBottom="$2">
      {/* Header with Back Button and SearchBar */}
      <XStack alignItems="center" gap="$2">
        <XStack onPress={onBackPress} hitSlop={20}>
          <Ionicons 
            name="chevron-back" 
            size={24} 
            color={theme.foreground.get()} 
          />
        </XStack>
        <SearchBar
          placeholder="Search listings..."
          initialValue={currentSearchQuery}
          onSearch={onSearchChange}
          onSearchSubmit={onSearchSubmit}
          navigateToResults={false}
          autoFocus={false}
          includeSafeArea={false}
        />
      </XStack>

      {/* Results Count, Filter and Sort Options */}
      <XStack alignItems="center" justifyContent="space-between">
        <SearchResultsCount
          totalFound={totalFound}
          isLoading={isLoading}
          hasError={hasError}
        />

        <XStack alignItems="center" gap="$2">
          <SearchFilterButton
            activeFiltersCount={activeFiltersCount}
            onPress={onFilterPress}
          />
          <SearchSortButton
            currentSortLabel={currentSortLabel}
            onPress={onSortPress}
          />
        </XStack>
      </XStack>
    </YStack>
  );
};