import React from 'react';
import { View } from 'tamagui';

/**
 * Skeleton component for listing description section
 * Shows while description data is loading
 */
export function DescriptionSkeleton() {
  return (
    <View gap="$2">
      <View height={20} backgroundColor="$gray3" borderRadius="$3" />
      <View height={20} width="85%" backgroundColor="$gray3" borderRadius="$3" />
      <View height={20} width="60%" backgroundColor="$gray3" borderRadius="$3" />
    </View>
  );
}