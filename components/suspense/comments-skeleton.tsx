import React from 'react';
import { View } from 'tamagui';

/**
 * Skeleton component for comments list section
 * Shows while comments data is loading
 */
export function CommentsSkeleton() {
  return (
    <View gap="$3">
      {[...Array(3)].map((_, index) => (
        <View key={index} gap="$2">
          <View height={20} width="30%" backgroundColor="$gray3" borderRadius="$3" />
          <View height={60} backgroundColor="$gray3" borderRadius="$3" />
        </View>
      ))}
    </View>
  );
}