import { Button } from "@/components/ui/button";
import { requireAuth } from "@/utils/auth-helper";
import { View } from "tamagui";

export default function BottomButton({
  isLoading,
  onPress,
}: {
  isLoading?: boolean;
  onPress?: () => void;
}) {
  const handlePress = () => {
    // Check authentication before allowing contact seller action
    if (!requireAuth()) {
      return;
    }
    
    onPress?.();
  };
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
          onPress={handlePress}
          disabled={isLoading}
          borderRadius="$10"
        >
          {isLoading ? "Loading..." : "Contact Seller"}
        </Button>
    </View>
  );
}
