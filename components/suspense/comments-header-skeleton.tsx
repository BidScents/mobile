import React from 'react';
import { View } from 'tamagui';

/**
 * Skeleton component for comments header section
 * Shows while voting data is loading
 */
export function CommentsHeaderSkeleton() {
  return (
    <View gap="$3">
      <View height={40} backgroundColor="$gray3" borderRadius="$3" />
      <View height={20} width="60%" backgroundColor="$gray3" borderRadius="$3" />
    </View>
  );
}