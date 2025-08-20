import { useMarkNotificationsSeen, useNotificationsList } from '@/hooks/queries/use-notifications';
import { useNotifications } from '@/hooks/use-notifications';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { router, Tabs } from "expo-router";
import React from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from 'tamagui';

export default function TabsLayout() {
  const theme = useTheme();
  
  // Get notification data and badge management
  const { data: notificationData } = useNotificationsList();
  const markAsSeen = useMarkNotificationsSeen();
  const { clearBadge, clearNotifications } = useNotifications();
  
  const unseenCount = notificationData?.unseen_count || 0;

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
        console.error('Error marking notifications as seen:', error);
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
          backgroundColor: theme.background.get(),
        },
        headerTitleStyle: {
          color: theme.foreground.get(),
        },
        tabBarActiveTintColor: theme.foreground.get(),
        tabBarInactiveTintColor: theme.mutedForeground.get(),
        tabBarStyle: {
          position: 'absolute',
          borderTopWidth: 0,
          height: 75,
        },
        tabBarItemStyle: {
          padding: 5,
        },
        tabBarBackground: () => (
          <BlurView tint={theme.blurTint.get() as any} style={{ 
            ...StyleSheet.absoluteFillObject,
            overflow: 'hidden',
            backgroundColor: 'transparent',
           }} />
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
          headerShown: false,
          tabBarIcon: ({ focused, color }) => (
            <Ionicons 
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
          title: "Chat",
          headerShown: true,
          tabBarIcon: ({ focused, color }) => (
            <Ionicons 
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
            <Ionicons 
              name={focused ? "add-circle" : "add-circle-outline"} 
              size={28} 
              color={color} 
            />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.push('/add-listing')
          },
        }}
      />
      
      <Tabs.Screen 
        name="notifications" 
        options={{
          title: "Notifications",
          headerShown: true,
          tabBarBadge: unseenCount > 0 ? (unseenCount > 99 ? '99+' : unseenCount.toString()) : undefined,
          tabBarIcon: ({ focused, color }) => (
            <Ionicons 
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
            <Ionicons 
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
                router.replace('/profile');
              } catch (error) {
                // Fallback if dismissAll fails
                router.push('/profile');
              }
            }


          },
        }}
      />
    </Tabs>
    </>
  );
}