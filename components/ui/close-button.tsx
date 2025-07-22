import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "@tamagui/core"
import { router } from "expo-router"
import { TouchableOpacity } from "react-native"

export const CloseButton = () => {
    const theme = useTheme()
    return (
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 0 }} hitSlop={20} >
            <Ionicons name="close" size={24}  style={{ backgroundColor: theme.background.val, color: theme.foreground?.val, }} />
        </TouchableOpacity>
    )
}