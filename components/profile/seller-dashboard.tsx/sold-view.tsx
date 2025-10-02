import { DashboardTransactionBottomSheet, DashboardTransactionBottomSheetMethods } from "@/components/forms/dashboard-transaction-bottom-sheet";
import { TransactionCard } from "@/components/profile/transaction-card";
import { ListingCardSkeleton } from "@/components/suspense/listing-card-skeleton";
import { Button } from "@/components/ui/button";
import { ThemedIonicons } from "@/components/ui/themed-icons";
import { currency } from "@/constants/constants";
import { useUserTransactions } from "@/hooks/queries/use-dashboard";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { SellerTransactionData } from "@bid-scents/shared-sdk";
import { LegendList } from "@legendapp/list";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { RefreshControl } from "react-native";
import { Text, View, XStack, YStack } from "tamagui";

const MemoizedTransactionCard = React.memo(TransactionCard);
const MemoizedListingCardSkeleton = React.memo(ListingCardSkeleton);

const GAP_SIZE = 12;

export default function SoldView() {
  const [canLoadMore, setCanLoadMore] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<SellerTransactionData | null>(null);
  const tabbarHeight = useBottomTabBarHeight();
  const colors = useThemeColors();
  const bottomSheetRef = useRef<DashboardTransactionBottomSheetMethods>(null);

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, refetch, isRefetching, error } = useUserTransactions();

  // Flatten the paginated data and get totals from first page
  const flatTransactions = data?.pages.flatMap(page => page.transactions) || [];
  const totalRevenue = data?.pages[0]?.total_revenue || 0;
  const transactionCount = data?.pages[0]?.transaction_count || 0;

  // Enable load more after initial render and when we have sufficient data
  useEffect(() => {
    const timer = setTimeout(() => {
      if (flatTransactions.length > 0) {
        setCanLoadMore(true);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [flatTransactions.length]);

  // Handle load more with proper throttling
  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage && canLoadMore) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, canLoadMore]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Handle transaction card press
  const handleTransactionPress = useCallback((transaction: SellerTransactionData) => {
    setSelectedTransaction(transaction);
    bottomSheetRef.current?.present();
  }, []);

  // Render transaction item
  const renderTransactionItem = useCallback(({ item, index }: { item: SellerTransactionData, index: number }) => {
    const isLeftColumn = index % 2 === 0;
    
    return (
      <View 
        style={{
          paddingLeft: isLeftColumn ? 0 : GAP_SIZE / 2,
          paddingRight: isLeftColumn ? GAP_SIZE / 2 : 0,
          paddingBottom: GAP_SIZE,
        }}
      >
        <MemoizedTransactionCard 
          transaction={item}
          onPress={() => handleTransactionPress(item)}
        />
      </View>
    );
  }, [handleTransactionPress]);

  // Render loading skeleton
  const renderSkeletonItem = useCallback(({ index }: { index: number }) => {
    const isLeftColumn = index % 2 === 0;
    
    return (
      <View 
        key={`skeleton-${index}`}
        style={{
          paddingLeft: isLeftColumn ? 0 : GAP_SIZE / 2,
          paddingRight: isLeftColumn ? GAP_SIZE / 2 : 0,
          paddingBottom: GAP_SIZE,
        }}
      >
        <MemoizedListingCardSkeleton />
      </View>
    );
  }, []);

  // Key extractor
  const keyExtractor = useCallback((item: SellerTransactionData) => item.id, []);

  // Render loading footer
  const renderFooter = useCallback(() => {
    if (!isFetchingNextPage) return null;
    
    return (
      <View paddingVertical="$4" flexDirection="row" style={{ gap: GAP_SIZE }}>
        <View style={{ flex: 1 }}>
          <MemoizedListingCardSkeleton />
        </View>
        <View style={{ flex: 1 }}>
          <MemoizedListingCardSkeleton />
        </View>
      </View>
    );
  }, [isFetchingNextPage]);

  // Render header with totals
  const renderHeader = useCallback(() => {
    if (isLoading || !data?.pages[0]) return null;

    return (
      <YStack gap="$3" paddingBottom="$4">
        <XStack justifyContent="space-between" alignItems="center" gap="$4">
          <YStack flex={1} backgroundColor="$muted" padding="$3" borderRadius="$5" alignItems="center">
            <Text fontSize="$7" fontWeight="700" color="$foreground">
              {currency} {totalRevenue.toFixed(2)}
            </Text>
            <Text fontSize="$3" color="$mutedForeground" textAlign="center">
              Total Revenue
            </Text>
          </YStack>
          <YStack flex={1} backgroundColor="$muted" padding="$3" borderRadius="$5" alignItems="center">
            <Text fontSize="$7" fontWeight="700" color="$foreground">
              {transactionCount}
            </Text>
            <Text fontSize="$3" color="$mutedForeground" textAlign="center">
              Transactions
            </Text>
          </YStack>
        </XStack>
      </YStack>
    );
  }, [isLoading, data, totalRevenue, transactionCount]);


  // Loading state - show skeleton grid
  if (isLoading) {
    const skeletonData = Array.from({ length: 6 }, (_, index) => ({ id: index }));
    
    return (
      <LegendList
        data={skeletonData}
        renderItem={renderSkeletonItem}
        estimatedItemSize={260}
        numColumns={2}
        recycleItems
        showsVerticalScrollIndicator={false}
        keyExtractor={(item: any) => `skeleton-${item.id}`}
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ paddingBottom: tabbarHeight }}
      />
    );
  }

  // Error state
  if (error) {
    return (
      <View flex={1} justifyContent="center" alignItems="center" paddingHorizontal="$6">
        <ThemedIonicons 
          name="alert-circle-outline" 
          size={64} 
          color={colors.mutedForeground} 
          style={{ marginBottom: 16 }} 
        />
        <Text fontSize="$6" fontWeight="600" color="$foreground" textAlign="center" marginBottom="$2">
          Something went wrong
        </Text>
        <Text fontSize="$4" color="$mutedForeground" textAlign="center" marginBottom="$4">
          We couldn&apos;t load your transactions. Please try again.
        </Text>
        <Button variant="secondary" onPress={handleRefresh}>
          Try Again
        </Button>
      </View>
    );
  }

  // Empty state
  if (!flatTransactions || flatTransactions.length === 0) {
    return (
      <View flex={1} justifyContent="center" alignItems="center" paddingHorizontal="$6">
        <ThemedIonicons 
          name="receipt-outline" 
          size={64} 
          color={colors.mutedForeground} 
          style={{ marginBottom: 16 }} 
        />
        <Text fontSize="$6" fontWeight="600" color="$foreground" textAlign="center" marginBottom="$2">
          No Transactions Yet
        </Text>
        <Text fontSize="$4" color="$mutedForeground" textAlign="center" marginBottom="$4">
          You haven&apos;t made any sales yet. Your completed transactions will appear here.
        </Text>
      </View>
    );
  }

  // Results list
  return (
    <View flex={1}>
      <LegendList
        data={flatTransactions}
        renderItem={renderTransactionItem}
        estimatedItemSize={260}
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
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ paddingBottom: tabbarHeight }}
      />
      
      <DashboardTransactionBottomSheet 
        ref={bottomSheetRef} 
        transaction={selectedTransaction} 
      />
    </View>
  );
}
