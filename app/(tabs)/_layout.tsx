import { darkBlur, lightBlur } from '@/tamagui.config';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { router, Tabs } from "expo-router";
import React from 'react';
import { StyleSheet, useColorScheme } from 'react-native';
import { useTheme } from 'tamagui';

export default function TabsLayout() {
  const theme = useTheme();
  const colorScheme = useColorScheme()

  const handleHapticFeedback = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <>
    <Tabs
      screenOptions={{
        headerShown: false,
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: theme.background?.val,
        },
        headerTitleStyle: {
          color: theme.foreground?.val,
        },
        tabBarActiveTintColor: theme.foreground?.val,
        tabBarInactiveTintColor: theme.mutedForeground?.val,
        tabBarLabelStyle: {
          fontSize: 12,
          paddingTop: 3,
          fontWeight: '500',
        },
        tabBarStyle: {
          position: 'absolute',
          borderTopWidth: 0,
        },
        tabBarBackground: () => (
          <BlurView tint={colorScheme === 'light' ? lightBlur : darkBlur} style={{ 
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
        name="index" 
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ focused, color }) => (
            <Ionicons 
              name={focused ? "home" : "home-outline"} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      
      
      <Tabs.Screen 
        name="add" 
        options={{
          title: "Add",
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
        name="inbox" 
        options={{
          title: "Inbox",
          headerShown: true,
          tabBarIcon: ({ focused, color }) => (
            <Ionicons 
              name={focused ? "chatbubbles" : "chatbubbles-outline"} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      
      <Tabs.Screen 
        name="profile" 
        options={{
          title: "Profile",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons 
              name={focused ? "person" : "person-outline"} 
              size={24} 
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