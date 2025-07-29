import React from 'react';
import { Text, View, XStack } from 'tamagui';

interface ProfileContentFooterProps {
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  onLoadMore: () => void;
}

export const ProfileContentFooter = React.memo(function ProfileContentFooter({
  isFetchingNextPage,
  hasNextPage,
  onLoadMore
}: ProfileContentFooterProps) {
  if (isFetchingNextPage) {
    return (
      <View paddingVertical="$4" alignItems="center">
        <Text color="$mutedForeground" fontWeight="500">Loading more...</Text>
      </View>
    );
  }
  
  if (hasNextPage) {
    return (
      <View paddingVertical="$4" alignItems="center">
        <XStack 
          alignItems="center" 
          justifyContent="center" 
          onPress={onLoadMore}
          hitSlop={16}
          pressStyle={{ opacity: 0.7 }}
          paddingHorizontal="$4"
          paddingVertical="$2"
          backgroundColor="$muted"
          borderRadius="$6"
        >
          <Text color="$foreground" fontWeight="500">
            Load More
          </Text>
        </XStack>
      </View>
    );
  }
  
  return null;
});
