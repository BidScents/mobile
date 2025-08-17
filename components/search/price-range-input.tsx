import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { useTheme } from "@tamagui/core";
import React from "react";
import { StyleSheet } from "react-native";
import { Text, XStack, YStack } from "tamagui";

export interface PriceRangeInputProps {
  minValue: number | null;
  maxValue: number | null;
  onMinChange: (value: number | null) => void;
  onMaxChange: (value: number | null) => void;
  placeholder?: string;
}

export const PriceRangeInput: React.FC<PriceRangeInputProps> = ({
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  placeholder = "Price",
}) => {
  const theme = useTheme();
  
  const handleMinChange = (text: string) => {
    if (text === "") {
      onMinChange(null);
      return;
    }
    const value = parseFloat(text);
    onMinChange(isNaN(value) ? null : value);
  };

  const handleMaxChange = (text: string) => {
    if (text === "") {
      onMaxChange(null);
      return;
    }
    const value = parseFloat(text);
    onMaxChange(isNaN(value) ? null : value);
  };

  return (
    <XStack gap="$3" alignItems="center">
      <YStack flex={1} gap="$2">
        <Text fontSize="$3" color="$mutedForeground">
          Min {placeholder}
        </Text>
        <BottomSheetTextInput
          style={[
            styles.textInput,
            {
              backgroundColor: theme.muted?.get(),
              color: theme.foreground?.get(),
              borderColor: theme.border?.get(),
            },
          ]}
          placeholder="0"
          placeholderTextColor={theme.mutedForeground?.get()}
          value={minValue?.toString() || ""}
          onChangeText={handleMinChange}
          keyboardType="numeric"
        />
      </YStack>
      
      <YStack flex={1} gap="$2">
        <Text fontSize="$3" color="$mutedForeground">
          Max {placeholder}
        </Text>
        <BottomSheetTextInput
          style={[
            styles.textInput,
            {
              backgroundColor: theme.muted?.get(),
              color: theme.foreground?.get(),
              borderColor: theme.border?.get(),
            },
          ]}
          placeholder="Any"
          placeholderTextColor={theme.mutedForeground?.get()}
          value={maxValue?.toString() || ""}
          onChangeText={handleMaxChange}
          keyboardType="numeric"
        />
      </YStack>
    </XStack>
  );
};

const styles = StyleSheet.create({
  textInput: {
    flex: 1,
    fontSize: 14,
    lineHeight: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 14,
    minHeight: 20,
    maxHeight: 200,
  },
});