import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Keyboard } from "react-native";
import { Text, XStack, useTheme } from "tamagui";

interface SearchSortButtonProps {
  currentSortLabel: string;
  onPress: () => void;
}

/**
 * Sort button component for search results
 */
export const SearchSortButton: React.FC<SearchSortButtonProps> = ({
  currentSortLabel,
  onPress,
}) => {
  const theme = useTheme();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Keyboard.dismiss();
    onPress();
  };

  return (
    <XStack
      alignItems="center"
      gap="$2"
      backgroundColor="$muted"
      borderRadius="$6"
      paddingHorizontal="$3"
      paddingVertical="$2"
      onPress={handlePress}
      pressStyle={{ backgroundColor: "$mutedPress" }}
    >
      <Text fontSize="$4" fontWeight="500" color={theme.foreground.val}>
        {currentSortLabel}
      </Text>
      <Ionicons
        name="chevron-down"
        size={16}
        color={theme.foreground.val}
      />
    </XStack>
  );
};