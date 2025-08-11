import { SelectBottomSheet } from "@/components/forms/select-bottom-sheet";
import { SearchFilterBottomSheet, SearchFilterBottomSheetMethods } from "@/components/search/search-filter-bottom-sheet";
import { SearchResultsList } from "@/components/search/search-results-list";
import { Container } from "@/components/ui/container";
import { SearchBar } from "@/components/ui/search-bar";
import { SEARCH_SORT_OPTIONS } from "@/constants/search.constants";
import { useSearchResults } from "@/hooks/use-search-results";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useCallback, useRef } from "react";
import { Keyboard } from "react-native";
import { Text, XStack, YStack, useTheme } from "tamagui";

export default function SearchResultsScreen() {
  const theme = useTheme();
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

  const handleSortSelect = useCallback((value: string) => {
    handleSortSelectBase(value);
    selectBottomSheetRef.current?.dismiss();
  }, [handleSortSelectBase]);

  const handleBackPress = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/index');
    }
  }, []);

  return (
    <Container variant="fullscreen" safeArea={["top"]} pb={tabbarHeight} backgroundColor="$background">
      <YStack gap="$3" pt="$2" paddingBottom="$2">
        {/* Header with Back Button and SearchBar */}
        <XStack alignItems="center" gap="$2" paddingHorizontal="$4">
          <XStack onPress={handleBackPress} hitSlop={20}>
            <Ionicons 
              name="chevron-back" 
              size={24} 
              color={theme.foreground.val} 
            />
          </XStack>
          <SearchBar
            placeholder="Search listings..."
            initialValue={currentSearchQuery}
            onSearch={handleSearchChange}
            onSearchSubmit={handleSearchSubmit}
            navigateToResults={false}
            autoFocus={false}
            includeSafeArea={false}
          />
        </XStack>
        {/* Results Count, Filter and Sort Options */}
        <XStack alignItems="center" justifyContent="space-between" paddingHorizontal="$4">
          {/* Results Count */}
          <XStack alignItems="center">
            {resultsData.isLoading ? (
              <Text fontSize="$4" fontWeight="500" color="$mutedForeground">
                Loading...
              </Text>
            ) : resultsData.hasError ? (
              <Text fontSize="$4" fontWeight="500" color="$red10">
                Error loading results
              </Text>
            ) : (
              <Text fontSize="$4" fontWeight="500" color="$mutedForeground">
                {resultsData.totalFound} {resultsData.totalFound === 1 ? 'result' : 'results'}
              </Text>
            )}
          </XStack>

          {/* Filter and Sort */}
          <XStack alignItems="center" gap="$2">
            <XStack
              alignItems="center"
              gap="$2"
              backgroundColor="$muted"
              borderRadius="$6"
              paddingHorizontal="$3"
              paddingVertical="$2"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Keyboard.dismiss();
                filterBottomSheetRef.current?.present();
              }}
              pressStyle={{ backgroundColor: "$mutedPress" }}
            >
              <Ionicons name="filter" size={16} color={theme.foreground.val} />
              <Text fontSize="$4" fontWeight="500" color={theme.foreground.val}>
                Filter {activeFiltersCount > 0 && `(${activeFiltersCount})`}
              </Text>
            </XStack>
            
            <XStack
              alignItems="center"
              gap="$2"
              backgroundColor="$muted"
              borderRadius="$6"
              paddingHorizontal="$3"
              paddingVertical="$2"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Keyboard.dismiss();
                selectBottomSheetRef.current?.present();
              }}
              pressStyle={{ backgroundColor: "$mutedPress" }}
            >
              <Text fontSize="$4" fontWeight="500" color={theme.foreground.val}>
                {currentSortLabel}
              </Text>
              <Ionicons
                name="chevron-down"
                size={16}
                color={theme.foreground.val}
              />
            </XStack>
          </XStack>
        </XStack>
      </YStack>

      {/* Search Results */}
      <SearchResultsList 
        searchParams={searchParams} 
        onRefresh={handleRefresh}
        onDataChange={handleDataChange}
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