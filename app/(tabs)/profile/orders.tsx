import { AnimatedTabHeader } from "@/components/ui/animated-tab-header";
import { Container } from "@/components/ui/container";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useState } from "react";
import { Text, View } from "tamagui";

export default function OrdersScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const [activeTabKey, setActiveTabKey] = useState("active");
  const tabs = [
    { key: "active", title: "Active" },
    { key: "completed", title: "Completed" },
  ];

  const renderTabContent = (tabKey: string) => {
    switch (tabKey) {
      case "active":
        return <Text>Active Tab Content</Text>;
      case "completed":
        return <Text>Completed Tab Content</Text>;
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
