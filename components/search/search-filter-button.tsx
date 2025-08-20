import { ThemedIonicons } from "../ui/themed-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Keyboard } from "react-native";
import { Text, XStack } from "tamagui";

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
      hitSlop={10}
    >
      <ThemedIonicons name="filter" size={16}  />
      <Text fontSize="$4" fontWeight="500" >
        Filter {activeFiltersCount > 0 && `(${activeFiltersCount})`}
      </Text>
    </XStack>
  );
};