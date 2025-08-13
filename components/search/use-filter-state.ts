import { FilterParameter, ListingBoxCondition, ListingCategory, ListingType } from "@bid-scents/shared-sdk";
import { useState } from "react";

export const useFilterState = (initialFilters: FilterParameter) => {
  const [localFilters, setLocalFilters] = useState<FilterParameter>(initialFilters);

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

  const updatePriceRange = (minPrice: number | null, maxPrice: number | null) => {
    setLocalFilters(prev => ({
      ...prev,
      min_price: minPrice,
      max_price: maxPrice,
    }));
  };

  const updatePurchaseYearRange = (minYear: number | null, maxYear: number | null) => {
    setLocalFilters(prev => ({
      ...prev,
      min_purchase_year: minYear,
      max_purchase_year: maxYear,
    }));
  };

  const resetFilters = (clearedFilters: FilterParameter) => {
    setLocalFilters(clearedFilters);
  };

  const syncFilters = (filters: FilterParameter) => {
    setLocalFilters(filters);
  };

  return {
    localFilters,
    toggleListingType,
    toggleCategory,
    toggleBoxCondition,
    updatePriceRange,
    updatePurchaseYearRange,
    resetFilters,
    syncFilters,
  };
};