import { Container } from "@/components/ui/container";
import { Text } from "tamagui";

export default function SettingsScreen() {
  return (
    <Container variant="padded" safeArea={["top"]} backgroundColor="$background">
      <Text>Settings Screen</Text>
    </Container>
  );
}
