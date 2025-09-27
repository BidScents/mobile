import CompletedView from "@/components/profile/orders/completed-view";
import PendingView from "@/components/profile/orders/pending-view";
import { AnimatedTabHeader } from "@/components/ui/animated-tab-header";
import { Container } from "@/components/ui/container";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import React, { useState } from "react";
import { View } from "tamagui";

export default function OrdersScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const [activeTabKey, setActiveTabKey] = useState("Pending");
  const tabs = [
    { key: "Pending", title: "Pending" },
    { key: "Bought", title: "Bought" },
  ];

  const renderTabContent = (tabKey: string) => {
    switch (tabKey) {
      case "Pending":
        return <PendingView />;
      case "Bought":
        return <CompletedView />;
      default:
        return null;
    }
  };

  return (
    <Container variant="padded" safeArea={false}>
      <AnimatedTabHeader
        tabs={tabs}
        activeTabKey={activeTabKey}
        onTabPress={(tabKey) => setActiveTabKey(tabKey)}
        headerProps={{ marginTop: "0", fontSize: "$6", fontWeight: "500", paddingHorizontal: "$0" }}
      />

      <View flex={1} marginBottom={tabBarHeight} paddingHorizontal="$3">
        {tabs.map((tab) => (
          <View
            key={tab.key}
            flex={1}
            style={{
              display: activeTabKey === tab.key ? "flex" : "none",
            }}
          >
            {renderTabContent(tab.key)}
          </View>
        ))}
      </View>
    </Container>
  );
}
