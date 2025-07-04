import { Tabs } from "expo-router";


export default function TabsLayout() {
    return (
        <Tabs>
            <Tabs.Screen name="index" />
            <Tabs.Screen name="search" />
            <Tabs.Screen name="create-listing" />
            <Tabs.Screen name="inbox" />
            <Tabs.Screen name="profile" />
        </Tabs>
    )
}