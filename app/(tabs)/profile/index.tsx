import { Container } from "@/components/ui/container";
import { useAuthStore } from "@bid-scents/shared-sdk";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Avatar, ScrollView, Text, XStack, YStack, useTheme } from "tamagui";

const SettingsSections = [
  {
    title: "General",
    sections: [
      {
        name: "Badges",
        icon: "star-outline",
        src: "/profile/badges",
      },
      {
        name: "Favourite Listings",
        icon: "heart-outline",
        src: "/profile/favourite-listings",
      },
      {
        name: "My Orders",
        icon: "cube-outline",
        src: "/profile/orders",
      },
      {
        name: "Seller Dashboard",
        icon: "storefront-outline",
        src: "/profile/seller-dashboard",
      },
      {
        name: "Settings",
        icon: "settings-outline",
        src: "/profile/settings",
      },
    ],
  },
  {
    title: "Support and Information",
    sections: [
      {
        name: "Help Center",
        icon: "help-circle-outline",
        src: "/profile/help",
      },
      {
        name: "About Us",
        icon: "information-circle-outline",
        src: "/profile/about-us",
      },
      {
        name: "Terms and Conditions",
        icon: "document-text-outline",
        src: "/profile/legal",
      },
    ],
  },
];

const handlePress = (link: string) => {
  router.push(link as any);
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};

export default function ProfileScreen() {
  const { user } = useAuthStore();
  const theme = useTheme();
  return (
    <Container variant="padded" safeArea={false} backgroundColor="$background">
      <ScrollView
        contentContainerStyle={{ gap: "$5", backgroundColor: "$background" }}
      >
        {/* Profile Card */}
        <XStack
          alignItems="center"
          justifyContent="space-between"
          bg="$muted"
          borderRadius="$6"
          px="$4"
          py="$3"
          onPress={() => handlePress("/profile/[id]")}
          pressStyle={{
            backgroundColor: "$mutedPress",
          }}
        >
          <XStack alignItems="center" gap="$3">
            <Avatar circular size="$5">
              {user?.profile_image_url &&
              user.profile_image_url.trim() !== "" ? (
                <Avatar.Image
                  source={{ uri: user.profile_image_url }}
                  onError={() => console.log("Avatar image failed to load")}
                />
              ) : null}
              <Avatar.Fallback
                backgroundColor="$foreground"
                justifyContent="center"
                alignItems="center"
              >
                <Ionicons
                  name="person"
                  size={22}
                  color={theme.background?.val}
                />
              </Avatar.Fallback>
            </Avatar>

            <YStack alignSelf="center" gap="$1">
              <Text fontSize="$5" fontWeight="500">
                @{user?.username}
              </Text>
              <Text fontSize="$4" fontWeight="400">
                View my profile
              </Text>
            </YStack>
          </XStack>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.foreground?.val}
          />
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
        </YStack>
      </ScrollView>
    </Container>
  );
}
