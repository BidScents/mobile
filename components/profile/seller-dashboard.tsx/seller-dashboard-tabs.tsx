import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, LayoutChangeEvent } from 'react-native';
import { Text, View, XStack } from 'tamagui';
import { useThemeColors } from '../../../hooks/use-theme-colors';
import ActiveView from './active-view';
import FeaturedView from './featured-view';
import PendingView from './pending-view';
import SoldView from './sold-view';

interface DashboardTab {
  key: string;
  title: string;
  content: React.ReactNode;
}

interface SellerDashboardTabsProps {
  initialTab?: string;
  onTabChange?: (tabKey: string) => void;
}

interface TabLayout {
  x: number;
  width: number;
}

export default function SellerDashboardTabs({
  initialTab,
  onTabChange,
}: SellerDashboardTabsProps) {
  // Define dashboard tabs
  const tabs: DashboardTab[] = [
    {
      key: 'active',
      title: 'Active',
      content: <ActiveView />,
    },
    {
      key: 'featured',
      title: 'Featured',
      content: <FeaturedView />,
    },
    {
      key: 'pending',
      title: 'Pending',
      content: <PendingView />,
    },
    {
      key: 'sold',
      title: 'Sold',
      content: <SoldView />,
    },
  ];

  const [activeTabKey, setActiveTabKey] = useState(initialTab || tabs[0]?.key || '');
  const [tabLayouts, setTabLayouts] = useState<Record<string, TabLayout>>({});
  const [containerWidth, setContainerWidth] = useState(0);
  const [loadedTabs, setLoadedTabs] = useState<Set<string>>(new Set([initialTab || tabs[0]?.key || '']));

  const tabBarHeight = useBottomTabBarHeight();
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

  return (
    <View flex={1} gap="$3">
      {/* Tab Header */}
      <View marginTop="$4" paddingHorizontal="$4">
        <XStack
          gap="$2"
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
                fontSize="$4"
                fontWeight="600"
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
      <View flex={1} marginBottom={tabBarHeight}>
        {tabs.map((tab) => (
          <View
            key={tab.key}
            flex={1}
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