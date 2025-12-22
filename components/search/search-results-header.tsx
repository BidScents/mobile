import { SearchBar } from "@/components/ui/search-bar";
import React from "react";
import { XStack, YStack } from "tamagui";
import { AnimatedTabHeader } from "../ui/animated-tab-header";
import { ThemedIonicons } from "../ui/themed-icons";
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
  
  // Tabs
  activeTab: string;
  onTabPress: (key: string) => void;
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
  activeTab,
  onTabPress,
}) => {

  return (
    <YStack gap="$1" paddingBottom="$2">
      {/* Header with Back Button and SearchBar */}
      <XStack alignItems="center" gap="$2">
        <XStack onPress={onBackPress} hitSlop={20}>
          <ThemedIonicons 
            name="chevron-back" 
            size={24} 
             
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

      <YStack gap="$3">
        <AnimatedTabHeader
          tabs={[ {key: "listings", title: "Listings"},{key: "users", title: "Users"},]}
          activeTabKey={activeTab!}
          onTabPress={(key) => onTabPress(key)}
          headerProps={{ marginTop: "0", fontSize: "$5", paddingHorizontal: "0" }}
        />

        {activeTab === 'listings' && (
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
        )}
      </YStack>
    </YStack>
  );
};