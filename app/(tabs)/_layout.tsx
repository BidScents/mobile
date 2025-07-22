import { SearchBar } from '@/components/ui/search-bar';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { router, Tabs } from "expo-router";
import React from 'react';
import { StyleSheet } from 'react-native';
import { useTheme, XStack } from 'tamagui';

export default function TabsLayout() {
  const theme = useTheme();

  const handleHapticFeedback = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <>
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: theme.foreground?.val,
        tabBarInactiveTintColor: theme.mutedForeground?.val,
        tabBarLabelStyle: {
          fontSize: 12,
          paddingTop: 3,
          fontWeight: '500',
        },
        tabBarStyle: {
          position: 'absolute',
        },
        tabBarBackground: () => (
          <BlurView  intensity={80} style={{ 
            ...StyleSheet.absoluteFillObject,
            overflow: 'hidden',
            backgroundColor: 'transparent',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
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
          header: () => 
            <XStack backgroundColor="$background">
                <SearchBar placeholder="Search" />
            </XStack>,
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
        name="search" 
        options={{
          title: "Search",
          header: () => 
            <XStack backgroundColor="$background">
              <SearchBar placeholder="Search" />
            </XStack>,
          tabBarIcon: ({ focused, color }) => (
            <Ionicons 
              name={focused ? "search" : "search-outline"} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      
      <Tabs.Screen 
        name="add" 
        options={{
          headerShown: false,
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
      />
    </Tabs>
    </>
  );
}