import { EditPreferencesRequest, NotificationsService } from "@bid-scents/shared-sdk";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
export function useNotificationsList(cursor?: string, limit?: number) {
    return useQuery({
        queryKey: queryKeys.notifications.list(cursor, limit),
        queryFn: () => NotificationsService.getNotificationsV1NotificationsGet(cursor, limit),
        staleTime: 2 * 60 * 1000, // 2 minutes - notifications change frequently
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
 * Invalidates all notification queries to update UI state
 */
export function useMarkNotificationsSeen() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: () => NotificationsService.markNotificationsSeenV1NotificationsMarkSeenPatch(),
        onSuccess: () => {
            // Invalidate all notification queries to update seen status
            queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
        },
    });
}