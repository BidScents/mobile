import { Container } from "@/components/ui/container";
import { EmptyUserListState } from "@/components/ui/empty-user-list-state";
import { ThemedIonicons } from "@/components/ui/themed-icons";
import { UserCard } from "@/components/ui/user-card";
import { UserCardSkeleton } from "@/components/ui/user-card-skeleton";
import { useUserFollowers } from "@/hooks/queries/use-profile";
import { UserPreview } from "@bid-scents/shared-sdk";
import { LegendList } from "@legendapp/list";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback } from "react";
import { Text, View, YStack } from "tamagui";


export default function FollowersScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const followersQuery = useUserFollowers(id!);

  // Flatten the paginated data
  const flatUsers = followersQuery.data?.pages.flatMap(page => page.users) || [];

  // Handle load more
  const handleLoadMore = useCallback(() => {
    if (followersQuery.hasNextPage && !followersQuery.isFetchingNextPage) {
      followersQuery.fetchNextPage();
    }
  }, [followersQuery]);

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
    if (!followersQuery.isFetchingNextPage) return null;
    
    return (
      <View paddingVertical="$3">
        <UserCardSkeleton />
      </View>
    );
  }, [followersQuery.isFetchingNextPage]);

  return (
    <Container variant="padded" safeArea={false}>
      <View flex={1} paddingTop="$4">
        {followersQuery.isLoading ? (
          // Loading state
          <LegendList
            data={Array.from({ length: 6 }, (_, index) => ({ id: index }))}
            renderItem={renderSkeletonItem}
            estimatedItemSize={70}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item: any) => `skeleton-${item.id}`}
          />
        ) : followersQuery.error ? (
          // Error state
          <YStack alignItems="center" justifyContent="center" flex={1} gap="$3">
            <ThemedIonicons
              name="alert-circle-outline"
              size={48}
              themeColor="error"
            />
            <Text fontSize="$6" fontWeight="600" color="$foreground" textAlign="center">
              Error Loading Followers
            </Text>
            <Text fontSize="$4" color="$mutedForeground" textAlign="center">
              Something went wrong. Please try again.
            </Text>
          </YStack>
        ) : flatUsers.length === 0 ? (
          // Empty state
          <EmptyUserListState
            iconName="people-outline"
            title="No followers"
            description="This user doesn't have any followers yet."
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
            onRefresh={followersQuery.refetch}
            ListFooterComponent={renderFooter}
            keyboardDismissMode="on-drag"
          />
        )}
      </View>
    </Container>
  );
}