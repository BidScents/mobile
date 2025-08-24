import { Container } from "@/components/ui/container";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Text } from "tamagui";

export default function ChatScreen() {
  return (
    <Container
      variant="padded"
      safeArea={["top"]}
      backgroundColor="$background"
    >
      <Text
        onPress={() => (
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
          router.push("/(screens)/(chat)/10")
        )}
      >
        Chat
      </Text>
    </Container>
  );
}
