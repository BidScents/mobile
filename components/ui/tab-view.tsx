import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useRef, useState, useContext } from 'react';
import { Animated, LayoutChangeEvent } from 'react-native';
import { Text, View, XStack } from 'tamagui';
import { useThemeColors } from '../../hooks/use-theme-colors';

interface TabConfig {
  key: string;
  title: string;
  content: React.ReactNode;
}

interface TabViewProps {
  tabs: TabConfig[];
  initialTab?: string;
  onTabChange?: (tabKey: string) => void;
  headerProps?: {
    marginTop?: string;
    gap?: string;
    fontSize?: string;
    fontWeight?: string;
    paddingHorizontal?: string;
  };
}

interface TabLayout {
  x: number;
  width: number;
}

export default function TabView({
  tabs,
  initialTab,
  onTabChange,
  headerProps = {},
}: TabViewProps) {
  const [activeTabKey, setActiveTabKey] = useState(initialTab || tabs[0]?.key || '');
  const [tabLayouts, setTabLayouts] = useState<Record<string, TabLayout>>({});
  const [containerWidth, setContainerWidth] = useState(0);
  const [loadedTabs, setLoadedTabs] = useState<Set<string>>(new Set([initialTab || tabs[0]?.key || '']));

  const tabBarHeight = useContext(BottomTabBarHeightContext) || 0;
  const colors = useThemeColors();
  
  // Animation values for the indicator
  const indicatorPosition = useRef(new Animated.Value(0)).current;
  const indicatorWidth = useRef(new Animated.Value(0)).current;

  // Handle tab press
  const handleTabPress = useCallback((tabKey: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (tabKey !== activeTabKey) {
      setActiveTabKey(tabKey);
      setLoadedTabs(prev => new Set([...prev, tabKey])); // Mark tab as loaded
      onTabChange?.(tabKey);
    }
  }, [activeTabKey, onTabChange]);

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
    paddingHorizontal = '$3',
  } = headerProps;

  return (
    <View gap="$3">
      {/* Tab Header */}
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

      {/* Tab Content - Render all loaded tabs but only show active one */}
      <View marginBottom={tabBarHeight}>
        {tabs.map((tab) => (
          <View
            key={tab.key}
            style={{
              display: activeTabKey === tab.key ? 'flex' : 'none',
            }}
          >
            {loadedTabs.has(tab.key) ? tab.content : null}
          </View>
        ))}
      </View>
    </View>
  );
}