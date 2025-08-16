import { EditPreferencesRequest, NotificationsService } from "@bid-scents/shared-sdk";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { queryKeys } from './query-keys';

/**
 * Register device token for push notifications
 * Used internally by the notification setup hook to register the device with the backend
 */
export function useAddDeviceToken() {
    return useMutation({
        mutationFn: (token: string) => NotificationsService.addDeviceTokenV1NotificationsDeviceTokenPost({
            token
        }),
    })
}

/**
 * Fetch paginated notifications for the current user
 * Supports cursor-based pagination for infinite scroll
 * 
 * @param cursor - Timestamp cursor for pagination (ISO format)
 * @param limit - Number of notifications to fetch (default: 20)
 * @returns Query result with notifications list and pagination data
 */
export function useNotificationsList(cursor?: string, limit?: number ) {
    const [stableCursor] = useState(() => new Date().toISOString());
    const finalCursor = cursor || stableCursor;
    return useQuery({
        queryKey: queryKeys.notifications.list(),
        queryFn: () => NotificationsService.getNotificationsV1NotificationsGet(finalCursor, limit),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

/**
 * Get user's notification preferences
 * Used for settings screens to display current notification settings
 */
export function useNotificationPreferences() {
    return useQuery({
        queryKey: queryKeys.notifications.preferences,
        queryFn: () => NotificationsService.getNotificationPreferencesV1NotificationsNotificationPreferencesGet(),
        staleTime: 10 * 60 * 1000, // 10 minutes - preferences change infrequently
    });
}

/**
 * Update user's notification preferences
 * Invalidates preferences cache on success to ensure UI reflects changes
 * 
 * @param preferences - Updated notification preference settings
 */
export function useEditNotificationPreferences() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (preferences: EditPreferencesRequest) => 
            NotificationsService.editNotificationPreferencesV1NotificationsNotificationPreferencesPatch(preferences),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.notifications.preferences });
        },
    });
}

/**
 * Mark all notifications as seen/read
 * Typically called when user opens notifications screen
 * Optimistically updates cache without invalidating queries
 */
export function useMarkNotificationsSeen() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: () => NotificationsService.markNotificationsSeenV1NotificationsMarkSeenPatch(),
        onMutate: async () => {
            // Optimistically update the cache
            queryClient.setQueryData(queryKeys.notifications.list(), (oldData: any) => {
                if (!oldData) return oldData;
                
                return {
                    ...oldData,
                    unseen_count: 0,
                    notifications: oldData.notifications?.map((notification: any) => ({
                        ...notification,
                        is_seen: true
                    }))
                };
            });
        },
        onError: () => {
            // Revert optimistic update on error
            queryClient.invalidateQueries({ queryKey: queryKeys.notifications.list() });
        },
    });
}