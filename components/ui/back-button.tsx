import { router } from "expo-router"
import { TouchableOpacity } from "react-native"
import { ThemedIonicons } from "./themed-icons"

export const BackButton = () => {
    return (
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 0 }} hitSlop={20} >
            <ThemedIonicons name="arrow-back" size={24} />
        </TouchableOpacity>
    )
}