import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, LayoutChangeEvent } from 'react-native';
import { Text, View, XStack, useTheme } from 'tamagui';

interface AnimatedTabBarProps {
  tabs: readonly string[];
  activeTab: string;
  onTabPress: (tab: string) => void;
  marginTop?: string;
  gap?: string;
  fontSize?: string;
  fontWeight?: string;
  paddingHorizontal?: string;
}

interface TabLayout {
  x: number;
  width: number;
}

export default function AnimatedTabBar({
  tabs,
  activeTab,
  onTabPress,
  marginTop = '$4',
  gap = '$2',
  fontSize = '$4',
  fontWeight = '600',
  paddingHorizontal = '$3',
}: AnimatedTabBarProps) {
  const [tabLayouts, setTabLayouts] = useState<Record<string, TabLayout>>({});
  const indicatorPosition = useRef(new Animated.Value(0)).current;
  const indicatorWidth = useRef(new Animated.Value(0)).current;
  const [containerWidth, setContainerWidth] = useState(0);
  const theme = useTheme();

  // Handle tab press with haptic feedback
  const handleTabPress = useCallback(async (tab: string) => {
    if (tab !== activeTab) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onTabPress(tab);
    }
  }, [activeTab, onTabPress]);

  // Measure individual tab layout
  const handleTabLayout = useCallback((tab: string, event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    setTabLayouts(prev => ({
      ...prev,
      [tab]: { x, width }
    }));
  }, []);

  // Measure container layout
  const handleContainerLayout = useCallback((event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  }, []);

  // Animate indicator when active tab changes
  useEffect(() => {
    const activeTabLayout = tabLayouts[activeTab];
    if (activeTabLayout && containerWidth > 0) {
      const targetPosition = activeTabLayout.x;
      const targetWidth = activeTabLayout.width;

      // Animate both position and width simultaneously
      Animated.parallel([
        Animated.spring(indicatorPosition, {
          toValue: targetPosition,
          useNativeDriver: false,
          tension: 300,
          friction: 25,
        }),
        Animated.spring(indicatorWidth, {
          toValue: targetWidth,
          useNativeDriver: false,
          tension: 300,
          friction: 25,
        }),
      ]).start();
    }
  }, [activeTab, tabLayouts, containerWidth]);

  return (
    <View marginTop={marginTop}>
      <XStack
        gap={gap}
        alignItems="center"
        justifyContent="space-between"
        position="relative"
        onLayout={handleContainerLayout}
      >
        {/* Animated sliding indicator */}
        <Animated.View
          style={{
            position: 'absolute',
            bottom: 0,
            height: 2,
            backgroundColor: theme.foreground?.val,
            borderRadius: 1,
            left: indicatorPosition,
            width: indicatorWidth,
          }}
        />

        {/* Tab buttons */}
        {tabs.map((tab) => (
          <View
            key={tab}
            flex={1}
            alignItems="center"
            onLayout={(event) => handleTabLayout(tab, event)}
          >
            <Text
              fontSize={fontSize}
              fontWeight={fontWeight}
              color={activeTab === tab ? '$foreground' : '$mutedForeground'}
              onPress={() => handleTabPress(tab)}
              paddingVertical="$2"
              paddingHorizontal={paddingHorizontal}
              textAlign="center"
              lineHeight="$6"
            >
              {tab}
            </Text>
          </View>
        ))}
      </XStack>
    </View>
  );
}