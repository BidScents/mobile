import { Container } from "@/components/ui/container"
import { Text } from "tamagui"

export default function ProfileScreen() {
    return (
        <Container variant="padded" safeArea={false} backgroundColor="$background">
            <Text>Profile</Text>
        </Container>
    )
}