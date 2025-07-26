import { Container } from "@/components/ui/container"
import { useAuthStore } from "@bid-scents/shared-sdk"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { Avatar, Text, XStack, YStack } from "tamagui"

const SettingsSections = [
    {
        title: "General",
        sections: [
            {
                name: "Badges",
                icon: "person",
                onPress: () => router.push("/profile")
            },
            {
                name: "Favourite Listings",
                icon: "heart",
                onPress: () => router.push("/profile")
            },
            {
                name: "My Orders",
                icon: "box",
                onPress: () => router.push("/profile")
            },
            {
                name: "Sellar Dashboard",
                icon: "person",
                onPress: () => router.push("/profile")
            },
            {
                name: "Settings",
                icon: "person",
                onPress: () => router.push("/profile")
            }
        ]
    },
    {
        title: "Support and Information",
        sections: [
            {
                name: "Help Center",
                icon: "person",
                onPress: () => router.push("/profile")
            },
            {
                name: "About Us",
                icon: "person",
                onPress: () => router.push("/profile")
            },
            {
                name: "Terms and Conditions",
                icon: "person",
                onPress: () => router.push("/profile")
            }
        ]
    }
]


export default function ProfileScreen() {
    const { user } = useAuthStore()
    return (
        <Container variant="padded" safeArea={false} backgroundColor="$background">
            {/* Profile Card */}
            <XStack alignItems="center" justifyContent="space-between">
                <Avatar circular size="$6">
                    <Avatar.Image src={user?.profile_image_url || ""} />
                    <Avatar.Fallback bc="red" />
                </Avatar>
                <YStack>
                    <Text>@{user?.username}</Text>
                    <Text>View my profile</Text>
                </YStack>
                <Ionicons name="chevron-forward" size={24} color="$foreground" />
            </XStack>

            {/* Settings */}
            <YStack>
                {SettingsSections.map((section, index) => (
                    <YStack key={index}>
                        <Text>{section.title}</Text>
                        {section.sections.map((item, index) => (
                            <XStack key={index} alignItems="center" justifyContent="space-between">
                                <XStack alignItems="center" gap="$2">
                                    <Ionicons name={item.icon as any} size={24} color="$foreground" />
                                    <Text>{item.name}</Text>
                                </XStack>
                                <Ionicons name="chevron-forward" size={24} color="$foreground" />
                            </XStack>
                        ))}
                    </YStack>
                ))}
            </YStack>
            
        </Container>
    )
}