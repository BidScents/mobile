import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { handleSignOut } from "@/utils/auth-initialization";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Alert } from "react-native";
import { ScrollView, Text, XStack, YStack, useTheme } from "tamagui";

const SettingsSections = [
  {
    title: "Account",
    sections: [
      {
        name: "Profile Details",
        icon: "person-outline",
        src: "/profile/settings/edit-profile",
      },
      {
        name: "Account Details",
        icon: "card-outline",
        src: "/profile/settings/account",
      },
      {
        name: "Payments",
        icon: "wallet-outline",
        src: "/profile/settings/payments",
      },
      {
        name: "Postage",
        icon: "mail-outline",
        src: "/profile/settings/postage",
      },
    ],
  },
  {
    title: "Preferences",
    sections: [
      {
        name: "Notifications",
        icon: "notifications-outline",
        src: "/profile/settings/notification-preferences",
      },
      {
        name: "Theme",
        icon: "color-palette-outline",
        src: "/profile/settings/theme",
      },
    ],
  },
];

const handlePress = (link: string) => {
  router.push(link as any);
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};

export default function SettingsScreen() {
  const theme = useTheme();

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          handleSignOut();
        },
      },
    ]);
  };

  return (
    <Container variant="padded" safeArea={false} backgroundColor="$background">
      <ScrollView
        contentContainerStyle={{ gap: "$5", backgroundColor: "$background" }}
      >
        {/* Settings Sections */}
        <YStack gap="$5">
          {SettingsSections.map((section, index) => (
            <YStack key={index} gap="$3">
              <Text fontSize="$5" fontWeight="500">
                {section.title}
              </Text>
              <YStack borderRadius="$6" backgroundColor="$muted">
                {section.sections.map((item, index) => (
                  <XStack
                    key={index}
                    alignItems="center"
                    justifyContent="space-between"
                    px="$4"
                    py="$4"
                    borderRadius="$6"
                    onPress={() => handlePress(item.src)}
                    pressStyle={{
                      backgroundColor: "$mutedPress",
                    }}
                  >
                    <XStack
                      alignItems="center"
                      justifyContent="center"
                      gap="$2"
                    >
                      <Ionicons
                        name={item.icon as any}
                        size={20}
                        color={theme.foreground?.val}
                      />
                      <Text fontSize="$5" fontWeight="400">
                        {item.name}
                      </Text>
                    </XStack>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={theme.foreground?.val}
                    />
                  </XStack>
                ))}
              </YStack>
            </YStack>
          ))}

          {/* Logout Section */}
          <YStack borderRadius="$6">
            <Button
              onPress={handleLogout}
              variant="ghost"
              leftIcon="log-out-outline"
            >
              Log Out
            </Button>
          </YStack>
        </YStack>
      </ScrollView>
    </Container>
  );
}
