import { Container } from "@/components/ui/container";
import { useLocalSearchParams } from "expo-router";
import { Text } from "tamagui";

export default function SpecificChatScreen() {
  const { id } = useLocalSearchParams();
  return (
    <Container
      variant="padded"
      safeArea={["top"]}
      backgroundColor="$background"
    >
      <Text>Specific Chat Screen {id}</Text>
    </Container>
  );
}
