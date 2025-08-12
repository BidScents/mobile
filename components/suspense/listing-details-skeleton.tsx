import React from 'react';
import { View } from 'tamagui';

/**
 * Skeleton component for listing details section
 * Shows while detailed listing information is loading
 * Matches the key-value pair layout of the real component
 */
export function ListingDetailsSkeleton() {
  return (
    <View 
      backgroundColor="$gray2" 
      borderRadius="$6" 
      padding="$4" 
      gap="$4"
    >
      {/* Simulate 6 key-value rows like Category, Purchase Year, etc. */}
      {[...Array(6)].map((_, index) => (
        <View key={index} flexDirection="row" justifyContent="space-between" alignItems="center">
          <View height={18} width="35%" backgroundColor="$gray4" borderRadius="$5" />
          <View height={18} width="25%" backgroundColor="$gray4" borderRadius="$5" />
        </View>
      ))}
    </View>
  );
}