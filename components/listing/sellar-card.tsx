import { UserPreview } from "@bid-scents/shared-sdk";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Text, XStack, YStack, useTheme } from "tamagui";
import { AvatarIcon } from "../ui/avatar-icon";

export function SellerCard({ seller }: { seller: UserPreview }) {
  const theme = useTheme();

  const handlePress = (link: string) => {
    router.push(link as any);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <XStack
      alignItems="center"
      justifyContent="space-between"
      borderRadius="$6"
      py="$3"
      onPress={() => handlePress(`/profile/${seller.id}`)}
    >
      <XStack alignItems="center" gap="$3">
        <AvatarIcon url={seller.profile_image_url} size="$5" />

        <YStack alignSelf="center" gap="$1">
          <Text fontSize="$5" fontWeight="500">
            @{seller.username}
          </Text>
          <Text fontSize="$4" fontWeight="400">
            Checkout my store!
          </Text>
        </YStack>
      </XStack>

      <XStack
        alignItems="center"
        gap="$2"
        px="$3"
        py="$3"
        bg="$muted"
        borderRadius="$5"
      >
        <Ionicons name="bag-outline" size={20} color={theme.foreground?.val} />
        <Text fontSize="$4" fontWeight="400">
          View Store
        </Text>
      </XStack>
    </XStack>
  );
}
