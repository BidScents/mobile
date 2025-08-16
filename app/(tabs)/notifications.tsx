import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import NotificationCard from "@/components/ui/notification-card";
import { NotificationCardSkeleton } from "@/components/ui/notification-card-skeleton";
import { useNotificationsList } from "@/hooks/queries/use-notifications";
import { LegendList } from "@legendapp/list";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { YStack } from "tamagui";

export default function NotificationsScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const { data, isLoading, refetch, isFetching } = useNotificationsList();

  if (isLoading) {
    return (
      <Container variant="padded" safeArea={false} backgroundColor="$background">
        <YStack gap="$2" paddingBottom={tabBarHeight}>
          {Array.from({ length: 8 }).map((_, index) => (
            <NotificationCardSkeleton key={index} />
          ))}
        </YStack>
      </Container>
    );
  }

  if (data?.notifications?.length === 0) {
    return (
      <EmptyState
        title="No Notifications"
        description="You have no notifications yet."
      />
    );
  }

  return (
    <Container variant="padded" safeArea={false} backgroundColor="$background">
      <LegendList
        data={data?.notifications || []}
        renderItem={({ item }) => <NotificationCard notification={item} />}
        keyExtractor={(item) => item.id}
        refreshing={isFetching && !isLoading}
        onRefresh={refetch}
        showsVerticalScrollIndicator={false}
        estimatedItemSize={90}
        recycleItems
        contentContainerStyle={{
          gap: 8,
          paddingBottom: tabBarHeight,
        }}
      />
    </Container>
  );
}
