import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ThemedIonicons } from "@/components/ui/themed-icons";
import { handleDeleteAccountUI } from "@/utils/auth-ui-handlers";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { ScrollView, Text, XStack, YStack } from "tamagui";

const SettingsSections = [
  {
    title: "Account",
    sections: [
      {
        name: "Profile Details",
        icon: "person-outline",
        src: "/(tabs)/profile/edit-profile",
      },
      {
        name: "Payments",
        icon: "wallet-outline",
        src: "/(tabs)/profile/settings/payments",
      },
    ],
  },
  {
    title: "Preferences",
    sections: [
      {
        name: "Notifications",
        icon: "notifications-outline",
        src: "/(tabs)/profile/settings/notification-preferences",
      },
      {
        name: "Theme",
        icon: "color-palette-outline",
        src: "/(tabs)/profile/settings/theme",
      },
    ],
  },
];

const handlePress = (link: string) => {
  router.push(link as any);
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};

export default function SettingsScreen() {

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
                      <ThemedIonicons
                        name={item.icon as any}
                        size={20}
                      />
                      <Text fontSize="$5" fontWeight="400">
                        {item.name}
                      </Text>
                    </XStack>
                    <ThemedIonicons
                      name="chevron-forward"
                      size={20}
                    />
                  </XStack>
                ))}
              </YStack>
            </YStack>
          ))}

          <YStack borderRadius="$6">
            <Button
              onPress={handleDeleteAccountUI}
              variant="destructive"
              leftIcon="trash-outline"
            >
              Delete Account
            </Button>
          </YStack>
        </YStack>
      </ScrollView>
    </Container>
  );
}
