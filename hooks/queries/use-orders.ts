import { queryKeys } from "@/hooks/queries/query-keys"
import { OrderResponse, OrdersService } from "@bid-scents/shared-sdk"
import { useInfiniteQuery } from "@tanstack/react-query"

export type OrderStatus = 'pending' | 'completed'

/**
 * Get users orders with cursor-based pagination
 */
export function useOrders(status: OrderStatus, limit: number = 20) {
  return useInfiniteQuery({
    queryKey: status === 'pending' ? queryKeys.orders.pending : queryKeys.orders.completed,
    queryFn: ({ pageParam }) => {
      const cursorToUse = pageParam || new Date().toISOString();
      return OrdersService.getOrdersV1OrdersStatusGet(
        status,
        cursorToUse,
        limit
      );
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage: OrderResponse) => {
      return lastPage.orders[lastPage.orders.length - 1]?.updated_at || undefined
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: "always",
  })
}