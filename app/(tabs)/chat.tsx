import { Container } from "@/components/ui/container";
import { Text } from "tamagui";

export default function ChatScreen() {
    return (
        <Container variant="padded" safeArea={["top"]} backgroundColor="$background" >
            <Text>Chat</Text>
        </Container>
    )
}