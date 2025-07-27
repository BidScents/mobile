import { Container } from "@/components/ui/container";
import { Text } from "tamagui";

export default function HelpScreen() {
  return (
    <Container variant="padded" safeArea={["top"]} backgroundColor="$background">
      <Text>Help Screen</Text>
    </Container>
  );
}
