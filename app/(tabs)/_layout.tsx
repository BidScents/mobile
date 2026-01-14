import { ThemedIonicons } from "@/components/ui/themed-icons";
import { useConversationSummary } from "@/hooks/queries/use-messages";
import {
  useMarkNotificationsSeen,
  useNotificationsList,
} from "@/hooks/queries/use-notifications";
import { useNotifications } from "@/hooks/use-notifications";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { useAuthHelper } from "@/utils/auth-helper";
import * as Haptics from "expo-haptics";
import { router, Tabs } from "expo-router";
import React from "react";

export default function TabsLayout() {
  const colors = useThemeColors();
  const { requireAuth, isAuthenticated } = useAuthHelper();

  // Get notification data and badge management (only if authenticated)
  const { data: notificationData } = useNotificationsList();
  const markAsSeen = useMarkNotificationsSeen();
  const { clearBadge, clearNotifications } = useNotifications();

  // Get conversation data for chat badge (only if authenticated)
  const { data: conversationData } = useConversationSummary();

  const unseenCount = isAuthenticated ? (notificationData?.unseen_count || 0) : 0;
  const unreadMessagesCount = isAuthenticated ? (conversationData?.total_unread || 0) : 0;

  const handleHapticFeedback = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleNotificationsTap = async (e: any) => {
    // Only prevent navigation if user is not authenticated
    if (!isAuthenticated) {
      e.preventDefault();
      requireAuth();
      return;
    }

    // If authenticated, mark notifications as seen and allow normal navigation
    if (unseenCount > 0) {
      try {
        await markAsSeen.mutateAsync();
        await clearBadge();
        await clearNotifications();
      } catch (error) {
        console.error("Error marking notifications as seen:", error);
      }
    }
  };

  const handleChatTap = (e: any) => {
    // Only prevent navigation if user is not authenticated
    if (!isAuthenticated) {
      e.preventDefault();
      requireAuth();
      return;
    }
    // If authenticated, allow normal tab navigation
  };

  const handleAddListingTap = (e: any) => {
    e.preventDefault();
    if (!requireAuth()) {
      return;
    }
    router.push("/add-listing");
  };

  const handleProfileTap = async (e: any) => {
    // Only prevent navigation if user is not authenticated
    if (!isAuthenticated) {
      e.preventDefault();
      requireAuth();
      return;
    }
    // If authenticated, navigate to profile
    router.dismissTo("/profile");
  };

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          headerShown: false,
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTitleStyle: {
            color: colors.foreground,
          },
          tabBarActiveTintColor: colors.foreground,
          tabBarInactiveTintColor: colors.mutedForeground,
          tabBarStyle: {
            borderTopColor: colors.muted,
            paddingTop: 8,
            backgroundColor: colors.background,
            height: 80,
          },
        }}
        screenListeners={{
          tabPress: () => handleHapticFeedback(),
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            tabBarIcon: ({ focused, color }) => (
              <ThemedIonicons
                name={focused ? "home" : "home-outline"}
                size={28}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="chat"
          options={{
            title: "Messages",
            headerShown: true,
            tabBarBadge:
              unreadMessagesCount > 0
                ? unreadMessagesCount > 99
                  ? "99+"
                  : unreadMessagesCount.toString()
                : undefined,
            tabBarIcon: ({ focused, color }) => (
              <ThemedIonicons
                name={focused ? "chatbubbles" : "chatbubbles-outline"}
                size={28}
                color={color}
              />
            ),
          }}
          listeners={{
            tabPress: handleChatTap,
          }}
        />

        <Tabs.Screen
          name="add"
          options={{
            title: "Add Listing",
            tabBarIcon: ({ focused, color }) => (
              <ThemedIonicons
                name={focused ? "add-circle" : "add-circle-outline"}
                size={28}
                color={color}
              />
            ),
          }}
          listeners={{
            tabPress: handleAddListingTap,
          }}
        />

        <Tabs.Screen
          name="notifications"
          options={{
            title: "Notifications",
            headerShown: true,
            tabBarBadge:
              unseenCount > 0
                ? unseenCount > 99
                  ? "99+"
                  : unseenCount.toString()
                : undefined,
            tabBarIcon: ({ focused, color }) => (
              <ThemedIonicons
                name={focused ? "notifications" : "notifications-outline"}
                size={28}
                color={color}
              />
            ),
          }}
          listeners={{
            tabPress: handleNotificationsTap,
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ focused, color }) => (
              <ThemedIonicons
                name={focused ? "person" : "person-outline"}
                size={28}
                color={color}
              />
            ),
          }}
          listeners={{
            tabPress: handleProfileTap,
          }}
        />
      </Tabs>
    </>
  );
}
