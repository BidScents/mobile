import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useNavigation } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { View } from 'tamagui';
import { AnimatedTabHeader } from '../../ui/animated-tab-header';
import ActiveView from './active-view';
import FeaturedView from './featured-view';
import PendingView from './pending-view';
import { SelectButton } from './select-button';
import SoldView from './sold-view';

interface DashboardTab {
  key: string;
  title: string;
}

interface SellerDashboardTabsProps {
  initialTab?: string;
  onTabChange?: (tabKey: string) => void;
}

export default function SellerDashboardTabs({
  initialTab,
  onTabChange,
}: SellerDashboardTabsProps) {
  // Define dashboard tabs
  const tabs: DashboardTab[] = [
    { key: 'active', title: 'Active' },
    { key: 'featured', title: 'Featured' },
    { key: 'pending', title: 'Pending' },
    { key: 'sold', title: 'Sold' },
  ];

  // State management
  const [activeTabKey, setActiveTabKey] = useState(initialTab || tabs[0]?.key || '');
  const [loadedTabs, setLoadedTabs] = useState<Set<string>>(new Set([initialTab || tabs[0]?.key || '']));
  
  // Selection state for active tab
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedListings, setSelectedListings] = useState<Set<string>>(new Set());

  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation();

  // Handle tab press
  const handleTabPress = useCallback((tabKey: string) => {
    if (tabKey !== activeTabKey) {
      setActiveTabKey(tabKey);
      setLoadedTabs(prev => new Set([...prev, tabKey]));
      onTabChange?.(tabKey);
      
      // Reset selection state when changing tabs
      setIsSelectMode(false);
      setSelectedListings(new Set());
    }
  }, [activeTabKey, onTabChange]);

  // Handle select button actions
  const handleSelectAction = useCallback(() => {
    if (!isSelectMode) {
      // Enter select mode
      setIsSelectMode(true);
    } else if (selectedListings.size === 0) {
      // Cancel selection mode
      setIsSelectMode(false);
    } else {
      // Boost selected listings
      console.log('Boost listings:', Array.from(selectedListings));
      // TODO: Implement boost functionality
      // Reset state after boost
      setIsSelectMode(false);
      setSelectedListings(new Set());
    }
  }, [isSelectMode, selectedListings.size]);

  // Update header right button based on active tab and selection state
  useEffect(() => {
    if (activeTabKey === 'active' || activeTabKey === 'featured') {
      navigation.setOptions({
        headerRight: () => (
          <SelectButton
            isSelectMode={isSelectMode}
            selectedCount={selectedListings.size}
            onPress={handleSelectAction}
          />
        ),
      });
    } else {
      navigation.setOptions({
        headerRight: () => null,
      });
    }
  }, [activeTabKey, isSelectMode, selectedListings.size, navigation, handleSelectAction]);

  // Render tab content
  const renderTabContent = (tabKey: string) => {
    if (!loadedTabs.has(tabKey)) return null;

    switch (tabKey) {
      case 'active':
        return (
          <ActiveView
            isSelectMode={isSelectMode}
            selectedListings={selectedListings}
            setSelectedListings={setSelectedListings}
          />
        );
      case 'featured':
        return (
          <FeaturedView
            isSelectMode={isSelectMode}
            selectedListings={selectedListings}
            setSelectedListings={setSelectedListings}
          />
        );
      case 'pending':
        return <PendingView />;
      case 'sold':
        return <SoldView />;
      default:
        return <View />;
    }
  };

  return (
    <View flex={1} gap="$3">
      {/* Animated Tab Header */}
      <AnimatedTabHeader
        tabs={tabs}
        activeTabKey={activeTabKey}
        onTabPress={handleTabPress}
      />

      {/* Tab Content */}
      <View flex={1} marginBottom={tabBarHeight} paddingHorizontal="$3">
        {tabs.map((tab) => (
          <View
            key={tab.key}
            flex={1}
            style={{
              display: activeTabKey === tab.key ? 'flex' : 'none',
            }}
          >
            {renderTabContent(tab.key)}
          </View>
        ))}
      </View>
    </View>
  );
}