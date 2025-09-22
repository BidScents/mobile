import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, LayoutChangeEvent } from 'react-native';
import { Text, View, XStack } from 'tamagui';
import { useThemeColors } from '../../hooks/use-theme-colors';

interface Tab {
  key: string;
  title: string;
}

interface TabLayout {
  x: number;
  width: number;
}

interface AnimatedTabHeaderProps {
  tabs: Tab[];
  activeTabKey: string;
  onTabPress: (tabKey: string) => void;
  headerProps?: {
    marginTop?: string;
    gap?: string;
    fontSize?: string;
    fontWeight?: string;
    paddingHorizontal?: string;
  };
}

export function AnimatedTabHeader({
  tabs,
  activeTabKey,
  onTabPress,
  headerProps = {},
}: AnimatedTabHeaderProps) {
  const [tabLayouts, setTabLayouts] = useState<Record<string, TabLayout>>({});
  const [containerWidth, setContainerWidth] = useState(0);
  const colors = useThemeColors();
  
  // Animation values for the indicator
  const indicatorPosition = useRef(new Animated.Value(0)).current;
  const indicatorWidth = useRef(new Animated.Value(0)).current;

  // Handle tab press
  const handleTabPress = useCallback((tabKey: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (tabKey !== activeTabKey) {
      onTabPress(tabKey);
    }
  }, [activeTabKey, onTabPress]);

  // Measure individual tab layout
  const handleTabLayout = useCallback((tabKey: string, event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    setTabLayouts(prev => ({
      ...prev,
      [tabKey]: { x, width }
    }));
  }, []);

  // Measure container layout
  const handleContainerLayout = useCallback((event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  }, []);

  // Animate tab indicator when active tab changes
  useEffect(() => {
    const activeTabLayout = tabLayouts[activeTabKey];
    if (activeTabLayout && containerWidth > 0) {
      const targetPosition = activeTabLayout.x;
      const targetWidth = activeTabLayout.width;

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
  }, [activeTabKey, tabLayouts, containerWidth]);

  // Header props with defaults
  const {
    marginTop = '$4',
    gap = '$2',
    fontSize = '$4',
    fontWeight = '600',
    paddingHorizontal = '$4',
  } = headerProps;

  return (
    <View marginTop={marginTop} paddingHorizontal={paddingHorizontal}>
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
            backgroundColor: colors.foreground,
            borderRadius: 1,
            left: indicatorPosition,
            width: indicatorWidth,
          }}
        />

        {/* Tab buttons */}
        {tabs.map((tab) => (
          <View
            key={tab.key}
            flex={1}
            alignItems="center"
            onLayout={(event) => handleTabLayout(tab.key, event)}
          >
            <Text
              fontSize={fontSize}
              fontWeight={fontWeight}
              color={activeTabKey === tab.key ? '$foreground' : '$mutedForeground'}
              onPress={() => handleTabPress(tab.key)}
              paddingVertical="$2"
              textAlign="center"
              lineHeight="$9"
            >
              {tab.title}
            </Text>
          </View>
        ))}
      </XStack>
    </View>
  );
}