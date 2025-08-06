import { Button } from "@/components/ui/button";
import { Ionicons } from "@expo/vector-icons";
import { View, useTheme } from "tamagui";

export default function AuctionButton({
  isLoading,
  onPress,
}: {
  isLoading?: boolean;
  onPress?: () => void;
}) {
  const theme = useTheme();
  return (
    <View
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
      paddingHorizontal="$4"
      paddingBottom="$4"
      backgroundColor="transparent"
      position="absolute"
      bottom={10}
      left={0}
      right={0}
      gap="$4"
    >
      <View p="$3" backgroundColor="$foreground" borderRadius="$6">
        <Ionicons name="remove-outline" size={24} color={theme.background.val} />
      </View>
      <Button
        variant="primary"
        size="lg"
        flex={1}
        onPress={onPress}
        disabled={isLoading}
        borderRadius="$6"
      >
        {isLoading ? "Loading..." : "Bid Now"}
      </Button>
      <View p="$3" backgroundColor="$foreground" borderRadius="$6">
        <Ionicons name="add-outline" size={24} color={theme.background.val} />
      </View>
    </View>
  );
}
