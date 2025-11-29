import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { createEmptyFilters, getActiveFiltersCount } from "@/utils/search.utils";
import { FilterParameter, ListingBoxCondition, ListingCategory, ListingType } from "@bid-scents/shared-sdk";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import * as Haptics from "expo-haptics";
import React, { forwardRef, useImperativeHandle } from "react";
import { ScrollView, Text, XStack, YStack } from "tamagui";
import { useThemeColors } from '../../hooks/use-theme-colors';
import { BOX_CONDITION_LABELS, CATEGORY_LABELS, LISTING_TYPE_LABELS } from "./constants";
import { MultiSelectChip } from "./multi-select-chip";
import { PriceRangeInput } from "./price-range-input";
import { useFilterState } from "./use-filter-state";

export interface SearchFilterBottomSheetMethods {
  present: () => void;
  dismiss: () => void;
}

export interface SearchFilterBottomSheetProps {
  /** Current filter values */
  filters: FilterParameter;
  /** Callback when filters are applied */
  onFiltersChange: (filters: FilterParameter) => void;
}

export const SearchFilterBottomSheet = forwardRef<
  SearchFilterBottomSheetMethods,
  SearchFilterBottomSheetProps
>(({ filters, onFiltersChange }, ref) => {
  const colors = useThemeColors();
  const bottomSheetRef = React.useRef<BottomSheetModalMethods>(null);
  
  const {
    localFilters,
    toggleListingType,
    toggleCategory,
    toggleBoxCondition,
    updatePriceRange,
    updatePurchaseYearRange,
    resetFilters,
    syncFilters,
  } = useFilterState(filters);

  useImperativeHandle(ref, () => ({
    present: () => {
      syncFilters(filters);
      bottomSheetRef.current?.present();
    },
    dismiss: () => bottomSheetRef.current?.dismiss(),
  }));

  const handleApplyFilters = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onFiltersChange(localFilters);
    bottomSheetRef.current?.dismiss();
  };

  const handleClearFilters = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const clearedFilters = createEmptyFilters();
    resetFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const activeFiltersCount = getActiveFiltersCount(localFilters);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      backgroundStyle={{ backgroundColor: colors.background }}
      enableDynamicSizing
    >
      <YStack gap="$4" padding="$4" paddingBottom="$5">
        {/* Header */}
        <XStack alignItems="center" justifyContent="space-between">
          <Text fontSize="$7" fontWeight="600" color="$foreground">
            Filters
          </Text>
          <Button onPress={handleClearFilters} variant="ghost" size="sm">
            Clear All
          </Button>
        </XStack>

        {/* Filters Content */}
          <YStack gap="$5">
            {/* Listing Types */}
            <YStack gap="$3">
              <Text fontSize="$5" fontWeight="600" color="$foreground">
                Listing Types
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <XStack gap="$2" paddingRight="$4">
                  {Object.values(ListingType).map((type) => (
                    <MultiSelectChip<ListingType>
                      key={type}
                      label={LISTING_TYPE_LABELS[type]}
                      value={type}
                      isSelected={localFilters.listing_types?.includes(type) || false}
                      onToggle={toggleListingType}
                    />
                  ))}
                </XStack>
              </ScrollView>
            </YStack>

            {/* Categories */}
            <YStack gap="$3">
              <Text fontSize="$5" fontWeight="600" color="$foreground">
                Categories
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <XStack gap="$2" paddingRight="$4">
                  {Object.values(ListingCategory).map((category) => (
                    <MultiSelectChip<ListingCategory>
                      key={category}
                      label={CATEGORY_LABELS[category]}
                      value={category}
                      isSelected={localFilters.categories?.includes(category) || false}
                      onToggle={toggleCategory}
                    />
                  ))}
                </XStack>
              </ScrollView>
            </YStack>

            {/* Price Range */}
            <YStack gap="$3">
              <Text fontSize="$5" fontWeight="600" color="$foreground">
                Price Range
              </Text>
              <PriceRangeInput
                minValue={localFilters.min_price ?? null}
                maxValue={localFilters.max_price ?? null}
                onMinChange={(value) => updatePriceRange(value, localFilters.max_price ?? null)}
                onMaxChange={(value) => updatePriceRange(localFilters.min_price ?? null, value)}
              />
            </YStack>

            {/* Purchase Year */}
            <YStack gap="$3">
              <Text fontSize="$5" fontWeight="600" color="$foreground">
                Purchase Year
              </Text>
              <PriceRangeInput
                minValue={localFilters.min_purchase_year ?? null}
                maxValue={localFilters.max_purchase_year ?? null}
                onMinChange={(value) => updatePurchaseYearRange(value, localFilters.max_purchase_year ?? null)}
                onMaxChange={(value) => updatePurchaseYearRange(localFilters.min_purchase_year ?? null, value)}
                placeholder="Year"
              />
            </YStack>

            {/* Box Conditions */}
            <YStack gap="$3">
              <Text fontSize="$5" fontWeight="600" color="$foreground">
                Box Condition
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <XStack gap="$2" paddingRight="$4">
                  {Object.values(ListingBoxCondition).map((condition) => (
                    <MultiSelectChip<ListingBoxCondition>
                      key={condition}
                      label={BOX_CONDITION_LABELS[condition]}
                      value={condition}
                      isSelected={localFilters.box_conditions?.includes(condition) || false}
                      onToggle={toggleBoxCondition}
                    />
                  ))}
                </XStack>
              </ScrollView>
            </YStack>
          </YStack>

        {/* Apply Button */}
        <Button
          onPress={handleApplyFilters}
          variant="primary"
          size="lg"
          fullWidth
          borderRadius="$10"
          mt="$4"
        >
          Apply Filters
        </Button>
      </YStack>
    </BottomSheet>
  );
});

SearchFilterBottomSheet.displayName = "SearchFilterBottomSheet";

