import { Button } from "@/components/ui/button";
import * as Haptics from "expo-haptics";
import React from "react";
import { Text } from "tamagui";

export interface MultiSelectChipProps<T = string> {
  label: string;
  value: T;
  isSelected: boolean;
  onToggle: (value: T) => void;
}

export const MultiSelectChip = <T,>({
  label,
  value,
  isSelected,
  onToggle,
}: MultiSelectChipProps<T>) => {
  return (
    <Button
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
        onToggle(value);
      }}
      variant={isSelected ? "primary" : "secondary"}
      size="sm"
    >
      <Text fontSize="$3" fontWeight="400" color={isSelected ? "$background" : "$foreground"}>
        {label}
      </Text>
    </Button>
  );
};