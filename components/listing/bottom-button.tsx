import { Button } from "@/components/ui/button";
import { View } from "tamagui";

export default function BottomButton({
  isLoading,
  onPress,
}: {
  isLoading?: boolean;
  onPress?: () => void;
}) {
  return (
    <View
      paddingHorizontal="$4"
      paddingBottom="$4"
      backgroundColor="transparent"
      position="absolute"
      bottom={10}
      left={0}
      right={0}
    >
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onPress={onPress}
          disabled={isLoading}
          borderRadius="$10"
        >
          {isLoading ? "Loading..." : "Contact Seller"}
        </Button>
    </View>
  );
}
