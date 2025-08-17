import { Container } from "@/components/ui/container";
import { useRouter } from "expo-router";
import { Text } from "tamagui";

export default function SettingsScreen() {
    const router = useRouter();
  return (
    <Container variant="padded" safeArea={false} backgroundColor="$background">
      <Text onPress={() => router.push("/profile/settings/notification-preferences")}>Settings Screen!!!</Text>
    </Container>
  );
}
