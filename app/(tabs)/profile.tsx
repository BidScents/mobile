import { Container } from "@/components/ui/container";
import { useAuthStore } from "@bid-scents/shared-sdk";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Avatar, Text, XStack, YStack } from "tamagui";

const SettingsSections = [
  {
    title: "General",
    sections: [
      {
        name: "Badges",
        icon: "star-outline",
        src: "/profile",
      },
      {
        name: "Favourite Listings",
        icon: "heart-outline",
        src: "/profile",
      },
      {
        name: "My Orders",
        icon: "cube-outline",
        src: "/profile",
      },
      {
        name: "Sellar Dashboard",
        icon: "storefront-outline",
        src: "/profile",
      },
      {
        name: "Settings",
        icon: "settings-outline",
        src: "/profile",
      },
    ],
  },
  {
    title: "Support and Information",
    sections: [
      {
        name: "Help Center",
        icon: "help-circle-outline",
        src: "/profile",
      },
      {
        name: "About Us",
        icon: "information-circle-outline",
        src: "/profile",
      },
      {
        name: "Terms and Conditions",
        icon: "document-text-outline",
        src: "/profile",
      },
    ],
  },
];

export default function ProfileScreen() {
  const { user } = useAuthStore();
  return (
    <Container variant="padded" safeArea={false} backgroundColor="$background">
      {/* Profile Card */}
      <XStack alignItems="center" justifyContent="space-between">
        <Avatar circular size="$6">
          <Avatar.Image src={user?.profile_image_url || ""} />
          <Avatar.Fallback bc="red" />
        </Avatar>
        <YStack>
          <Text>@{user?.username}</Text>
          <Text>View my profile</Text>
        </YStack>
        <Ionicons name="chevron-forward" size={20} color="$foreground" />
      </XStack>

      {/* Settings */}
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
                  onPress={() => router.push(item.src as any)}
                >
                  <XStack alignItems="center" justifyContent="center" gap="$2">
                    <Ionicons
                      name={item.icon as any}
                      size={20}
                      color="$foreground"
                    />
                    <Text fontSize="$5" fontWeight="400">
                      {item.name}
                    </Text>
                  </XStack>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color="$foreground"
                  />
                </XStack>
              ))}
            </YStack>
          </YStack>
        ))}
      </YStack>
    </Container>
  );
}
