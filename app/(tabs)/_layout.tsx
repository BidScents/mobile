import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Tabs } from "expo-router";
import { StyleSheet } from 'react-native';
import { useTheme } from 'tamagui';

export default function TabsLayout() {
  const theme = useTheme();

  const handleHapticFeedback = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
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
        name="create-listing" 
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
  );
}