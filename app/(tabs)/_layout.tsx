import { ThemedIonicons } from "@/components/ui/themed-icons";
import { useConversationSummary } from "@/hooks/queries/use-messages";
import {
  useMarkNotificationsSeen,
  useNotificationsList,
} from "@/hooks/queries/use-notifications";
import { useNotifications } from "@/hooks/use-notifications";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { router, Tabs } from "expo-router";
import React from "react";
import { StyleSheet } from "react-native";

export default function TabsLayout() {
  const colors = useThemeColors();

  // Get notification data and badge management
  const { data: notificationData } = useNotificationsList();
  const markAsSeen = useMarkNotificationsSeen();
  const { clearBadge, clearNotifications } = useNotifications();

  // Get conversation data for chat badge
  const { data: conversationData } = useConversationSummary();

  const unseenCount = notificationData?.unseen_count || 0;
  const unreadMessagesCount = conversationData?.total_unread || 0;

  const handleHapticFeedback = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleNotificationsTap = async () => {
    // Mark all notifications as seen
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
            position: "absolute",
            borderTopWidth: 0,
            height: 75,
          },
          tabBarItemStyle: {
            padding: 5,
          },
          tabBarBackground: () => (
            <BlurView
              tint={colors.blurTint as any}
              style={{
                ...StyleSheet.absoluteFillObject,
                overflow: "hidden",
                backgroundColor: "transparent",
              }}
            />
          ),
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
            tabPress: (e) => {
              e.preventDefault();
              router.push("/add-listing");
            },
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
            tabPress: async (e) => {
              if (router.canDismiss()) {
                e.preventDefault();
                try {
                  await router.dismissAll();
                  router.replace("/profile");
                } catch (error) {
                  // Fallback if dismissAll fails
                  router.push("/profile");
                }
              }
            },
          }}
        />
      </Tabs>
    </>
  );
}
