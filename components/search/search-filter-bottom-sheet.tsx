import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { FilterParameter, ListingBoxCondition, ListingCategory, ListingType } from "@bid-scents/shared-sdk";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { useTheme } from "@tamagui/core";
import * as Haptics from "expo-haptics";
import React, { forwardRef, useImperativeHandle, useState } from "react";
import { ScrollView, Text, XStack, YStack } from "tamagui";

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



interface MultiSelectChipProps<T = string> {
  label: string;
  value: T;
  isSelected: boolean;
  onToggle: (value: T) => void;
}

const MultiSelectChip = <T,>({
  label,
  value,
  isSelected,
  onToggle,
}: MultiSelectChipProps<T>) => {

  return (
    <Button
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
        onToggle(value);
      }}
      variant={isSelected ? "primary" : "secondary"}
      size="sm"
    >
      <Text fontSize="$3" fontWeight="400" color={isSelected ? "$background" : "$foreground"}>
        {label}
      </Text>
    </Button>
  );
};

interface PriceRangeInputProps {
  minValue: number | null;
  maxValue: number | null;
  onMinChange: (value: number | null) => void;
  onMaxChange: (value: number | null) => void;
  placeholder?: string;
}

const PriceRangeInput: React.FC<PriceRangeInputProps> = ({
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  placeholder = "Price",
}) => {
  // Note: In a real implementation, these would be connected to actual text inputs
  // For now, this is a placeholder UI that displays current values
  // The onMinChange and onMaxChange props are available for future implementation

  return (
    <XStack gap="$3" alignItems="center">
      <YStack flex={1}>
        <Text fontSize="$3" color="$mutedForeground" marginBottom="$2">
          Min {placeholder}
        </Text>
        <XStack
          backgroundColor="$muted"
          borderRadius="$4"
          paddingHorizontal="$3"
          paddingVertical="$2"
          alignItems="center"
        >
          <Text fontSize="$4" color="$mutedForeground">
            $
          </Text>
          <Text
            fontSize="$4"
            color="$foreground"
            flex={1}
            onPress={() => {
              // In a real implementation, this would open a number input
              // For now, we'll just show the current value
            }}
          >
            {minValue?.toString() || "0"}
          </Text>
        </XStack>
      </YStack>
      
      <Text fontSize="$4" color="$mutedForeground" marginTop="$4">
        to
      </Text>
      
      <YStack flex={1}>
        <Text fontSize="$3" color="$mutedForeground" marginBottom="$2">
          Max {placeholder}
        </Text>
        <XStack
          backgroundColor="$muted"
          borderRadius="$4"
          paddingHorizontal="$3"
          paddingVertical="$2"
          alignItems="center"
        >
          <Text fontSize="$4" color="$mutedForeground">
            $
          </Text>
          <Text
            fontSize="$4"
            color="$foreground"
            flex={1}
            onPress={() => {
              // In a real implementation, this would open a number input
              // For now, we'll just show the current value
            }}
          >
            {maxValue?.toString() || "Any"}
          </Text>
        </XStack>
      </YStack>
    </XStack>
  );
};

export const SearchFilterBottomSheet = forwardRef<
  SearchFilterBottomSheetMethods,
  SearchFilterBottomSheetProps
>(({ filters, onFiltersChange }, ref) => {
  const theme = useTheme();
  const bottomSheetRef = React.useRef<BottomSheetModalMethods>(null);
  
  // Local state for filters
  const [localFilters, setLocalFilters] = useState<FilterParameter>(filters);

  useImperativeHandle(ref, () => ({
    present: () => {
      setLocalFilters(filters);
      bottomSheetRef.current?.present();
    },
    dismiss: () => bottomSheetRef.current?.dismiss(),
  }));



  const toggleListingType = (type: ListingType) => {
    const currentTypes = localFilters.listing_types || [];
    const updatedTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
    
    setLocalFilters(prev => ({
      ...prev,
      listing_types: updatedTypes.length > 0 ? updatedTypes : null,
    }));
  };

  const toggleCategory = (category: ListingCategory) => {
    const currentCategories = localFilters.categories || [];
    const updatedCategories = currentCategories.includes(category)
      ? currentCategories.filter(c => c !== category)
      : [...currentCategories, category];
    
    setLocalFilters(prev => ({
      ...prev,
      categories: updatedCategories.length > 0 ? updatedCategories : null,
    }));
  };

  const toggleBoxCondition = (condition: ListingBoxCondition) => {
    const currentConditions = localFilters.box_conditions || [];
    const updatedConditions = currentConditions.includes(condition)
      ? currentConditions.filter(c => c !== condition)
      : [...currentConditions, condition];
    
    setLocalFilters(prev => ({
      ...prev,
      box_conditions: updatedConditions.length > 0 ? updatedConditions : null,
    }));
  };

  const handleApplyFilters = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onFiltersChange(localFilters);
    bottomSheetRef.current?.dismiss();
  };

  const handleClearFilters = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const clearedFilters: FilterParameter = {
      listing_types: null,
      categories: null,
      min_price: null,
      max_price: null,
      min_purchase_year: null,
      max_purchase_year: null,
      box_conditions: null,
      seller_ids: null,
    };
    setLocalFilters(clearedFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (localFilters.listing_types?.length) count++;
    if (localFilters.categories?.length) count++;
    if (localFilters.min_price || localFilters.max_price) count++;
    if (localFilters.min_purchase_year || localFilters.max_purchase_year) count++;
    if (localFilters.box_conditions?.length) count++;
    return count;
  };

  const listingTypeLabels = {
    [ListingType.FIXED_PRICE]: "Fixed Price",
    [ListingType.NEGOTIABLE]: "Negotiable",
    [ListingType.AUCTION]: "Auction",
    [ListingType.SWAP]: "Swap",
  };

  const categoryLabels = {
    [ListingCategory.DESIGNER]: "Designer",
    [ListingCategory.LOCAL]: "Local",
    [ListingCategory.ARABIAN_HOUSE]: "Arabian House",
    [ListingCategory.NICHE]: "Niche",
  };

  const boxConditionLabels = {
    [ListingBoxCondition.GOOD]: "Good",
    [ListingBoxCondition.DAMAGED]: "Damaged",
    [ListingBoxCondition.NO_BOX]: "No Box",
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      backgroundStyle={{ backgroundColor: theme.background?.val }}
      snapPoints={['80%']}
      enableDynamicSizing
    >
      <YStack gap="$4" padding="$4" paddingBottom="$8">
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
                      label={listingTypeLabels[type]}
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
                      label={categoryLabels[category]}
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
                onMinChange={(value) =>
                  setLocalFilters(prev => ({ ...prev, min_price: value }))
                }
                onMaxChange={(value) =>
                  setLocalFilters(prev => ({ ...prev, max_price: value }))
                }
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
                onMinChange={(value) =>
                  setLocalFilters(prev => ({ ...prev, min_purchase_year: value }))
                }
                onMaxChange={(value) =>
                  setLocalFilters(prev => ({ ...prev, max_purchase_year: value }))
                }
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
                      label={boxConditionLabels[condition]}
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
          Apply Filters {getActiveFiltersCount() > 0 && `(${getActiveFiltersCount()})`}
        </Button>
      </YStack>
    </BottomSheet>
  );
});

SearchFilterBottomSheet.displayName = "SearchFilterBottomSheet";
