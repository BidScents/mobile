import React from 'react';
import { View } from 'tamagui';

/**
 * Skeleton component for auction details section
 * Shows while detailed auction data is loading
 */
export function AuctionDetailsSkeleton() {
  return (
    <View gap="$3">
      <View height={25} width="40%" backgroundColor="$gray3" borderRadius="$3" />
      <View gap="$2">
        <View height={20} backgroundColor="$gray3" borderRadius="$3" />
        <View height={20} width="70%" backgroundColor="$gray3" borderRadius="$3" />
      </View>
      <View height={80} backgroundColor="$gray3" borderRadius="$3" />
    </View>
  );
}