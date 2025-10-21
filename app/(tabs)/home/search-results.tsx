import { SelectBottomSheet } from "@/components/forms/select-bottom-sheet";
import { SearchFilterBottomSheet, SearchFilterBottomSheetMethods } from "@/components/search/search-filter-bottom-sheet";
import { SearchResultsHeader } from "@/components/search/search-results-header";
import { SearchResultsList } from "@/components/search/search-results-list";
import { useFilterState } from "@/components/search/use-filter-state";
import { Container } from "@/components/ui/container";
import { SEARCH_SORT_OPTIONS } from "@/constants/search.constants";
import { useSearchResults } from "@/hooks/use-search-results";
import { createEmptyFilters } from "@/utils/search.utils";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useCallback, useRef } from "react";
import { Keyboard } from "react-native";

export default function SearchResultsScreen() {
  const tabbarHeight = useBottomTabBarHeight();
  
  const selectBottomSheetRef = useRef<BottomSheetModalMethods>(null);
  const filterBottomSheetRef = useRef<SearchFilterBottomSheetMethods>(null);

  const {
    searchParams,
    currentSearchQuery,
    filters,
    currentSortLabel,
    resultsData,
    handleSortSelect: handleSortSelectBase,
    handleFiltersChange,
    handleSearchChange,
    handleSearchSubmit,
    handleDataChange,
    handleRefresh,
    activeFiltersCount,
  } = useSearchResults();

  const {
    resetFilters,
    syncFilters,
  } = useFilterState(filters);

  const handleClearFilters = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const clearedFilters = createEmptyFilters();
      resetFilters(clearedFilters);
      handleFiltersChange(clearedFilters);
    };

  const handleSortSelect = useCallback((value: string) => {
    handleSortSelectBase(value);
    selectBottomSheetRef.current?.dismiss();
  }, [handleSortSelectBase]);

  const handleBackPress = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/home');
    }
  }, []);

  const handleFilterPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Keyboard.dismiss();
    filterBottomSheetRef.current?.present();
  }, []);

  const handleSortPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Keyboard.dismiss();
    selectBottomSheetRef.current?.present();
  }, []);

  return (
    <Container variant="padded" safeArea={["top"]} backgroundColor="$background">
      <SearchResultsHeader
        currentSearchQuery={currentSearchQuery}
        onSearchChange={handleSearchChange}
        onSearchSubmit={handleSearchSubmit}
        onBackPress={handleBackPress}
        totalFound={resultsData.totalFound}
        isLoading={resultsData.isLoading}
        hasError={resultsData.hasError}
        activeFiltersCount={activeFiltersCount}
        onFilterPress={handleFilterPress}
        currentSortLabel={currentSortLabel}
        onSortPress={handleSortPress}
      />

      {/* Search Results */}
      <SearchResultsList 
        searchParams={searchParams} 
        onRefresh={handleRefresh}
        onDataChange={handleDataChange}
        handleClearFilters={handleClearFilters}
      />

      {/* Sort Bottom Sheet */}
      <SelectBottomSheet
        ref={selectBottomSheetRef}
        options={SEARCH_SORT_OPTIONS.map((option) => ({
          label: option.label,
          value: option.value,
        }))}
        onSelect={handleSortSelect}
        title="Sort Results"
        subtitle="Choose how to sort the search results"
      />

      {/* Filter Bottom Sheet */}
      <SearchFilterBottomSheet
        ref={filterBottomSheetRef}
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />
    </Container>
  );
}