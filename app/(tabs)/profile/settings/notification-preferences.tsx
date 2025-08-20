import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Input } from "@/components/ui/input";
import { queryKeys } from "@/hooks/queries/query-keys";
import {
  useEditNotificationPreferences,
  useNotificationPreferences,
} from "@/hooks/queries/use-notifications";
import {
  areNotificationsEnabled,
  useNotifications,
} from "@/hooks/use-notifications";
import { useOptimisticMutation } from "@/hooks/use-optimistic-mutation";
import { EditPreferencesRequest } from "@bid-scents/shared-sdk";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useFocusEffect } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  AppState,
  AppStateStatus,
  Linking,
  RefreshControl,
} from "react-native";
import { ScrollView, Text, YStack } from "tamagui";

interface PreferenceSection {
  title: string;
  description?: string;
  preferences: {
    key: keyof EditPreferencesRequest;
    label: string;
  }[];
}

const PREFERENCE_SECTIONS: PreferenceSection[] = [
  {
    title: "Listing Activity",
    description: "Notifications about your listings and favorites",
    preferences: [
      {
        key: "listing_favorited",
        label: "Listing Favorited",
      },
      {
        key: "favorite_listing_edited",
        label: "Favorite Listing Edited",
      },
      {
        key: "listing_bid",
        label: "New Bids",
      },
      {
        key: "listing_comment",
        label: "Listing Comments",
      },
    ],
  },
  {
    title: "Auction Updates",
    description: "Notifications about auction activity",
    preferences: [
      {
        key: "outbid",
        label: "Outbid Alerts",
      },
      {
        key: "auction_expiry",
        label: "Auction Expiry",
      },
      {
        key: "auction_extension",
        label: "Auction Extensions",
      },
    ],
  },
  {
    title: "Social",
    description: "Notifications about followers and messages",
    preferences: [
      {
        key: "new_follower",
        label: "New Followers",
      },
      {
        key: "message",
        label: "Messages",
      },
    ],
  },
];

export default function NotificationPreferencesScreen() {
  const {
    data: preferences,
    isLoading,
    refetch,
    isRefetching,
  } = useNotificationPreferences();
  const editPreferences = useEditNotificationPreferences();
  const tabBarHeight = useBottomTabBarHeight();
  const queryClient = useQueryClient();
  const { requestPermissionsAndRegister } = useNotifications();

  // Permission status state
  const [notificationsEnabled, setNotificationsEnabled] = useState<
    boolean | null
  >(null);
  const [isCheckingPermissions, setIsCheckingPermissions] = useState(false);
  const lastCheckTime = useRef<number>(0);
  const appState = useRef(AppState.currentState);

  // Local switch states for smooth animations (decoupled from cache)
  const [localSwitchStates, setLocalSwitchStates] = useState<
    Record<string, boolean>
  >({});

  // Sync local switch states with server preferences
  useEffect(() => {
    if (preferences) {
      const newLocalStates: Record<string, boolean> = {};
      PREFERENCE_SECTIONS.forEach((section) => {
        section.preferences.forEach((pref) => {
          newLocalStates[pref.key] = preferences[pref.key] || false;
        });
      });
      setLocalSwitchStates(newLocalStates);
    }
  }, [preferences]);

  // Smart permission check - throttles rapid calls but allows legitimate focus checks
  const checkPermissions = useCallback(
    async (force = false) => {
      const now = Date.now();
      const timeSinceLastCheck = now - lastCheckTime.current;

      // Only throttle if called rapidly (< 500ms) AND not forced
      if (!force && timeSinceLastCheck < 500) {
        console.log("Skipping permission check - too rapid");
        return;
      }

      if (isCheckingPermissions) {
        console.log("Skipping permission check - already in progress");
        return;
      }

      lastCheckTime.current = now;
      setIsCheckingPermissions(true);

      try {
        const enabled = await areNotificationsEnabled();
        // Only update state if value actually changed
        if (enabled !== notificationsEnabled) {
          setNotificationsEnabled(enabled);
          console.log("Permission check result (changed):", enabled);
        } else {
          console.log("Permission check result (unchanged):", enabled);
        }
      } catch (error) {
        console.error("Error checking notification permissions:", error);
        setNotificationsEnabled(false);
      } finally {
        setIsCheckingPermissions(false);
      }
    },
    [isCheckingPermissions, notificationsEnabled]
  );

  // Check permissions when screen focuses
  useFocusEffect(
    useCallback(() => {
      checkPermissions();
    }, [checkPermissions])
  );

  // Also listen for app state changes (when returning from device settings)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      console.log("App state changed:", appState.current, "->", nextAppState);

      // If app is coming to foreground after being in background, force check
      if (appState.current === "background" && nextAppState === "active") {
        console.log(
          "App returned from background - force checking permissions"
        );
        checkPermissions(true); // Force check when returning from background
      }

      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => subscription?.remove();
  }, [checkPermissions]);

  const optimisticMutation = useOptimisticMutation({
    mutationFn: (changes: EditPreferencesRequest) =>
      editPreferences.mutateAsync(changes),
    onOptimisticUpdate: (changes: EditPreferencesRequest) => {
      // Immediately update cache for instant UI feedback
      queryClient.setQueryData(
        queryKeys.notifications.preferences,
        (old: any) => {
          if (!old) return old;
          return { ...old, ...changes };
        }
      );
    },
    onRevert: (originalValue: EditPreferencesRequest) => {
      // Revert cache to original state on error
      queryClient.setQueryData(
        queryKeys.notifications.preferences,
        originalValue
      );

      // Also revert local switch states to match server state
      const revertedLocalStates: Record<string, boolean> = {};
      PREFERENCE_SECTIONS.forEach((section) => {
        section.preferences.forEach((pref) => {
          revertedLocalStates[pref.key] = originalValue[pref.key] || false;
        });
      });
      setLocalSwitchStates(revertedLocalStates);
    },
    getCurrentValue: () => {
      return queryClient.getQueryData(
        queryKeys.notifications.preferences
      ) as EditPreferencesRequest;
    },
    getOriginalValue: () => preferences || {},
    enableDiffDetection: true,
    debounceMs: 1000,
  });

  const handleToggle = (key: keyof EditPreferencesRequest, value: boolean) => {
    // Update local state immediately for smooth animation
    setLocalSwitchStates((prev) => ({
      ...prev,
      [key]: value,
    }));

    // Then trigger the optimistic mutation for cache/API updates
    optimisticMutation.mutate({ [key]: value });
  };

  // Handle master notification switch
  const handleMasterToggle = async (enabled: boolean) => {
    if (enabled) {
      // User wants to enable notifications
      try {
        const success = await requestPermissionsAndRegister();
        if (success) {
          // Permission granted - update state immediately
          setNotificationsEnabled(true);
        } else {
          // Permission denied, show settings alert
          showSettingsAlert();
        }
      } catch (error) {
        console.error("Error requesting permissions:", error);
        showSettingsAlert();
      }
    } else {
      // User wants to disable notifications - send them to settings
      showSettingsAlert();
    }
  };

  // Show alert to open device settings
  const showSettingsAlert = () => {
    Alert.alert(
      "Notification Settings",
      "To change notification permissions, please go to your device settings.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Open Settings",
          onPress: () => Linking.openSettings(),
          style: "default",
        },
      ]
    );
  };

  return (
    <Container variant="padded" safeArea={false} backgroundColor="$background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => {
              refetch();
              checkPermissions();
            }}
          />
        }
      >
        <YStack gap="$4" paddingBottom={tabBarHeight} paddingTop="$2">
          {/* Master Push Notifications Switch */}
          <YStack gap="$3">
            <YStack gap="$1">
              <Text fontSize="$6" fontWeight="600" color="$foreground">
                Push Notifications
              </Text>
              <Text fontSize="$3" color="$mutedForeground">
                Enable push notifications to receive alerts
              </Text>
            </YStack>

            <Input
              variant="switch"
              label="Enable Push Notifications"
              placeholder=""
              value=""
              onChangeText={() => {}}
              switchChecked={notificationsEnabled === true}
              onSwitchChange={handleMasterToggle}
              disabled={isCheckingPermissions || notificationsEnabled === null}
            />

            {/* Show settings button when notifications are disabled */}
            {notificationsEnabled === false && (
              <Button variant="secondary" onPress={showSettingsAlert}>
                <Text color="$foreground">Open Device Settings</Text>
              </Button>
            )}
          </YStack>

          {/* Individual Notification Preferences - Only show when notifications enabled */}
          {notificationsEnabled === true && (
            <YStack gap="$4">
              {PREFERENCE_SECTIONS.map((section) => (
                <YStack key={section.title} gap="$3">
                  <YStack gap="$1">
                    <Text fontSize="$6" fontWeight="600" color="$foreground">
                      {section.title}
                    </Text>
                    {section.description && (
                      <Text fontSize="$3" color="$mutedForeground">
                        {section.description}
                      </Text>
                    )}
                  </YStack>

                  <YStack gap="$2.5">
                    {section.preferences.map((pref) => (
                      <YStack key={pref.key}>
                        <Input
                          variant="switch"
                          label={pref.label}
                          placeholder=""
                          value=""
                          onChangeText={() => {}}
                          switchChecked={
                            localSwitchStates[pref.key] ??
                            (preferences?.[pref.key] || false)
                          }
                          onSwitchChange={(value) =>
                            handleToggle(pref.key, value)
                          }
                          disabled={isLoading}
                        />
                      </YStack>
                    ))}
                  </YStack>
                </YStack>
              ))}
            </YStack>
          )}

          {/* Loading state when checking permissions */}
          {notificationsEnabled === null && (
            <YStack gap="$3" alignItems="center" paddingVertical="$4">
              <Text fontSize="$4" color="$mutedForeground">
                Checking notification permissions...
              </Text>
            </YStack>
          )}
        </YStack>
      </ScrollView>
    </Container>
  );
}
