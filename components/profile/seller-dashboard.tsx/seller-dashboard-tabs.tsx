import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useNavigation } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'tamagui';
import { BoostBottomSheet, BoostBottomSheetMethods } from '../../forms/boost-bottom-sheet';
import { AnimatedTabHeader } from '../../ui/animated-tab-header';
import ActiveView from './active-view';
import AuctionSettlementView from './auction-settlement-view';
import FeaturedView from './featured-view';
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
    { key: 'auction', title: 'Auction' },
    { key: 'sold', title: 'Sold' },
  ];

  const boostBottomSheetRef = useRef<BoostBottomSheetMethods>(null);

  // State management
  const [activeTabKey, setActiveTabKey] = useState(initialTab || tabs[0]?.key || '');
  const [loadedTabs, setLoadedTabs] = useState<Set<string>>(new Set([initialTab || tabs[0]?.key || '']));
  
  // Selection state for active tab
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [currentBoostListingId, setCurrentBoostListingId] = useState<string | null>(null);

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
    }
  }, [activeTabKey, onTabChange]);

  // Handle select button actions
  const handleSelectAction = useCallback(() => {
    if (!isSelectMode) {
      // Enter select mode
      setIsSelectMode(true);
    } else {
      // Cancel selection mode
      setIsSelectMode(false);
    }
  }, [isSelectMode]);

  // Handle individual listing boost
  const handleBoostListing = useCallback((listing: any) => {
    setCurrentBoostListingId(listing.id);
    boostBottomSheetRef.current?.present();
  }, []);

  // Handle boost success
  const handleBoostSuccess = useCallback(() => {
    setCurrentBoostListingId(null);
    // setIsSelectMode(false);
  }, []);

  // Update header right button based on active tab and selection state
  useEffect(() => {
    if (activeTabKey === 'active' || activeTabKey === 'featured') {
      navigation.setOptions({
        headerRight: () => (
          <SelectButton
            isSelectMode={isSelectMode}
            onPress={handleSelectAction}
          />
        ),
      });
    } else {
      navigation.setOptions({
        headerRight: () => null,
      });
    }
  }, [activeTabKey, isSelectMode, navigation, handleSelectAction]);

  // Render tab content
  const renderTabContent = (tabKey: string) => {
    if (!loadedTabs.has(tabKey)) return null;

    switch (tabKey) {
      case 'active':
        return (
          <ActiveView
            isSelectMode={isSelectMode}
            onBoost={handleBoostListing}
          />
        );
      case 'featured':
        return (
          <FeaturedView
            isSelectMode={isSelectMode}
            onBoost={handleBoostListing}
          />
        );
      case 'auction':
        return <AuctionSettlementView/>;
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
        headerProps={{ marginTop: "$2", fontSize: "$5", paddingHorizontal: "$3" }}
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

      <BoostBottomSheet 
        ref={boostBottomSheetRef} 
        tabKey={activeTabKey} 
        onSuccess={handleBoostSuccess}
        listingId={currentBoostListingId!}
      />
    </View>
  );
}