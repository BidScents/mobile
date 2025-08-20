import { ThemedIonicons } from "../ui/themed-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Keyboard } from "react-native";
import { Text, XStack } from "tamagui";

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
      <Text fontSize="$4" fontWeight="500" color="$foreground">
        {currentSortLabel}
      </Text>
      <ThemedIonicons
        name="chevron-down"
        size={16}
              />
    </XStack>
  );
};