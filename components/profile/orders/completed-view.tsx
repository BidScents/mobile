import { OrderBottomSheet, OrderBottomSheetMethods } from "@/components/forms/order-bottom-sheet";
import { ThemedIonicons } from "@/components/ui/themed-icons";
import { useOrders } from "@/hooks/queries/use-orders";
import { BuyerTransactionData } from "@bid-scents/shared-sdk";
import { LegendList } from "@legendapp/list";
import React, { useCallback, useMemo, useRef } from "react";
import { ActivityIndicator, RefreshControl } from "react-native";
import { Text, View, YStack } from "tamagui";
import { OrderCard } from "./order-card";

const GAP_SIZE = 12; // Same as active-view.tsx
const MemoizedOrderCard = React.memo(OrderCard);

export default function CompletedView() {
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useOrders('completed');

  const orderBottomSheetRef = useRef<OrderBottomSheetMethods>(null);
  const [selectedOrder, setSelectedOrder] = React.useState<BuyerTransactionData | null>(null);

  // Flatten all orders from all pages
  const allOrders = useMemo(() => {
    return data?.pages.flatMap(page => page.orders) || [];
  }, [data]);

  const handleOrderPress = useCallback((order: BuyerTransactionData) => {
    setSelectedOrder(order);
    orderBottomSheetRef.current?.present();
  }, []);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleConfirmReceipt = useCallback((orderId: string) => {
    // TODO: Implement confirm receipt functionality
    console.log('Confirm receipt for order:', orderId);
  }, []);

  const handleLeaveReview = useCallback((orderId: string) => {
    // TODO: Implement leave review functionality
    console.log('Leave review for order:', orderId);
  }, []);

  const renderOrderItem = useCallback(({ item, index }: { item: BuyerTransactionData; index: number }) => {
    const isLeftColumn = index % 2 === 0;
    
    return (
      <View 
        style={{
          paddingLeft: isLeftColumn ? 0 : GAP_SIZE / 2,
          paddingRight: isLeftColumn ? GAP_SIZE / 2 : 0,
          paddingBottom: GAP_SIZE,
        }}
      >
        <MemoizedOrderCard order={item} onPress={() => handleOrderPress(item)} />
      </View>
    );
  }, [handleOrderPress]);

  const renderEmptyState = () => (
    <View flex={1} alignItems="center" justifyContent="center" padding="$6">
      <ThemedIonicons
        name="bag-check-outline"
        size={64}
        color="$mutedForeground"
      />
      <Text
        fontSize="$5"
        fontWeight="500"
        color="$foreground"
        marginTop="$3"
        textAlign="center"
      >
        No Order History
      </Text>
      <Text
        fontSize="$4"
        color="$mutedForeground"
        marginTop="$2"
        textAlign="center"
      >
        You haven&apos;t completed any orders yet
      </Text>
    </View>
  );

  const renderErrorState = () => (
    <View flex={1} alignItems="center" justifyContent="center" padding="$6">
      <ThemedIonicons
        name="alert-circle-outline"
        size={64}
        color="red"
      />
      <Text
        fontSize="$5"
        fontWeight="500"
        color="$foreground"
        marginTop="$3"
        textAlign="center"
      >
        Failed to Load Orders
      </Text>
      <Text
        fontSize="$4"
        color="$mutedForeground"
        marginTop="$2"
        textAlign="center"
      >
        Please check your connection and try again
      </Text>
    </View>
  );

  const renderLoadingState = () => (
    <View flex={1} alignItems="center" justifyContent="center">
      <ActivityIndicator size="large" />
      <Text color="$mutedForeground" marginTop="$3">
        Loading your order history...
      </Text>
    </View>
  );

  // Key extractor
  const keyExtractor = useCallback((item: BuyerTransactionData) => item.id, []);

  // Render loading footer
  const renderFooter = useCallback(() => {
    if (!isFetchingNextPage) return null;
    
    return (
      <View paddingVertical="$4" flexDirection="row" style={{ gap: GAP_SIZE }}>
        <View style={{ flex: 1, height: 200, backgroundColor: "$muted", borderRadius: 8 }} />
        <View style={{ flex: 1, height: 200, backgroundColor: "$muted", borderRadius: 8 }} />
      </View>
    );
  }, [isFetchingNextPage]);

  if (isLoading) {
    return renderLoadingState();
  }

  if (error) {
    return renderErrorState();
  }

  if (allOrders.length === 0) {
    return renderEmptyState();
  }

  return (
    <YStack flex={1}>
      <LegendList
        data={allOrders}
        renderItem={renderOrderItem}
        estimatedItemSize={200}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        keyExtractor={keyExtractor}
        drawDistance={500}
        recycleItems
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
          />
        }
        ListFooterComponent={renderFooter}
        keyboardDismissMode="on-drag"
      />
      
      <OrderBottomSheet 
        ref={orderBottomSheetRef}
        order={selectedOrder}
        onConfirmReceipt={handleConfirmReceipt}
        onLeaveReview={handleLeaveReview}
      />
    </YStack>
  );
}
