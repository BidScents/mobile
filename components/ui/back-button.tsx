import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "@tamagui/core"
import { router } from "expo-router"
import { TouchableOpacity } from "react-native"

export const BackButton = () => {
    const theme = useTheme()
    return (
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 0 }} hitSlop={20} >
            <Ionicons name="arrow-back" size={24}  style={{ backgroundColor: theme.background.get(), color: theme.foreground?.get(), }} />
        </TouchableOpacity>
    )
}