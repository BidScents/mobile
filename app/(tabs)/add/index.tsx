import { Container } from "@/components/ui/container";
import { Text } from "tamagui";

export default function CreateListingScreen() {
    return (
        <Container variant="padded" safeArea={false} backgroundColor="$background">
            <Text>Create Listing</Text>
        </Container>
    )
}