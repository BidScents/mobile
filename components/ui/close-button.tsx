import { router } from "expo-router"
import { TouchableOpacity } from "react-native"
import { styled } from "@tamagui/core"
import { ThemedIonicons } from "./themed-icons"

const StyledThemedIonicons = styled(ThemedIonicons, {
    backgroundColor: '$background'
})

export const CloseButton = () => {
    return (
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 0 }} hitSlop={20} >
            <StyledThemedIonicons name="close" size={24} />
        </TouchableOpacity>
    )
}