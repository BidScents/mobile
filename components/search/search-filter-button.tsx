import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Keyboard } from "react-native";
import { Text, XStack, useTheme } from "tamagui";

interface SearchFilterButtonProps {
  activeFiltersCount: number;
  onPress: () => void;
}

/**
 * Filter button component for search results
 */
export const SearchFilterButton: React.FC<SearchFilterButtonProps> = ({
  activeFiltersCount,
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
      <Ionicons name="filter" size={16} color={theme.foreground.val} />
      <Text fontSize="$4" fontWeight="500" color={theme.foreground.val}>
        Filter {activeFiltersCount > 0 && `(${activeFiltersCount})`}
      </Text>
    </XStack>
  );
};