import { Container } from "@/components/ui/container";
import { Text } from "tamagui";

export default function NotificationsScreen() {
    return (
        <Container variant="padded" safeArea={["top"]} backgroundColor="$background" >
            <Text>Notifications</Text>
        </Container>
    )
}