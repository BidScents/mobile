import { Container } from "@/components/ui/container";
import NotificationCard from "@/components/ui/notification-card";
import { useNotificationsList } from "@/hooks/queries/use-notifications";
import { LegendList } from "@legendapp/list";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

export default function NotificationsScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const { data, isLoading, refetch, isFetching } = useNotificationsList();

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
