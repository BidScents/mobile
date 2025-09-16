import { Container } from "@/components/ui/container";
import { EmptyUserListState } from "@/components/ui/empty-user-list-state";
import { ThemedIonicons } from "@/components/ui/themed-icons";
import { UserCard } from "@/components/ui/user-card";
import { UserCardSkeleton } from "@/components/ui/user-card-skeleton";
import { useUserFollowing } from "@/hooks/queries/use-profile";
import { UserPreview } from "@bid-scents/shared-sdk";
import { LegendList } from "@legendapp/list";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback } from "react";
import { Text, View, YStack } from "tamagui";


export default function FollowingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const followingQuery = useUserFollowing(id!);

  // Flatten the paginated data
  const flatUsers = followingQuery.data?.pages.flatMap(page => page.users) || [];

  // Handle load more
  const handleLoadMore = useCallback(() => {
    if (followingQuery.hasNextPage && !followingQuery.isFetchingNextPage) {
      followingQuery.fetchNextPage();
    }
  }, [followingQuery]);

  // Render user item
  const renderUserItem = useCallback(({ item }: { item: UserPreview }) => (
    <View paddingBottom="$3">
      <UserCard user={item} />
    </View>
  ), []);

  // Render loading skeleton
  const renderSkeletonItem = useCallback(({ index }: { index: number }) => (
    <View key={`skeleton-${index}`} paddingBottom="$3">
      <UserCardSkeleton />
    </View>
  ), []);

  // Key extractor
  const keyExtractor = useCallback((item: UserPreview) => item.id, []);

  // Render loading footer
  const renderFooter = useCallback(() => {
    if (!followingQuery.isFetchingNextPage) return null;
    
    return (
      <View paddingVertical="$3">
        <UserCardSkeleton />
      </View>
    );
  }, [followingQuery.isFetchingNextPage]);

  return (
    <Container variant="padded" safeArea={false}>
      <View flex={1} paddingTop="$4">
        {followingQuery.isLoading ? (
          // Loading state
          <LegendList
            data={Array.from({ length: 6 }, (_, index) => ({ id: index }))}
            renderItem={renderSkeletonItem}
            estimatedItemSize={70}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item: any) => `skeleton-${item.id}`}
          />
        ) : followingQuery.error ? (
          // Error state
          <YStack alignItems="center" justifyContent="center" flex={1} gap="$3">
            <ThemedIonicons
              name="alert-circle-outline"
              size={48}
              themeColor="error"
            />
            <Text fontSize="$6" fontWeight="600" color="$foreground" textAlign="center">
              Error Loading Following
            </Text>
            <Text fontSize="$4" color="$mutedForeground" textAlign="center">
              Something went wrong. Please try again.
            </Text>
          </YStack>
        ) : flatUsers.length === 0 ? (
          // Empty state
          <EmptyUserListState
            iconName="person-add-outline"
            title="No following"
            description="This user isn't following anyone yet."
          />
        ) : (
          // Results list
          <LegendList
            data={flatUsers}
            renderItem={renderUserItem}
            estimatedItemSize={70}
            showsVerticalScrollIndicator={false}
            keyExtractor={keyExtractor}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.3}
            onRefresh={followingQuery.refetch}
            ListFooterComponent={renderFooter}
            keyboardDismissMode="on-drag"
          />
        )}
      </View>
    </Container>
  );
}