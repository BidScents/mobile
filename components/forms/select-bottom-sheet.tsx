import { BottomSheet } from "@/components/ui/bottom-sheet";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import * as Haptics from "expo-haptics";
import React, { forwardRef, useImperativeHandle } from "react";
import { Pressable } from "react-native";
import { Text, XStack, YStack } from "tamagui";
import { useThemeColors } from '../../hooks/use-theme-colors';
import { Button } from "../ui/button";
import { ThemedIonicons } from "../ui/themed-icons";

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectBottomSheetMethods extends BottomSheetModalMethods {
  dismiss: () => void;
}

interface SelectBottomSheetProps {
  options?: SelectOption[];
  onSelect: (value: string) => void;
  title?: string;
  subtitle?: string;
}

export const SelectBottomSheet = forwardRef<
  SelectBottomSheetMethods,
  SelectBottomSheetProps
>(
  (
    {
      options = [],
      onSelect,
      title = "Select Option",
      subtitle = "Choose from the available options below",
    },
    ref
  ) => {
    const colors = useThemeColors();
    const [selectedValue, setSelectedValue] = React.useState<string | null>(
      null
    );
    const bottomSheetRef = React.useRef<BottomSheetModalMethods>(null);

    useImperativeHandle(ref, () => ({
      present: () => bottomSheetRef.current?.present(),
      dismiss: () => bottomSheetRef.current?.dismiss(),
      close: () => bottomSheetRef.current?.close(),
      collapse: () => bottomSheetRef.current?.collapse(),
      expand: () => bottomSheetRef.current?.expand(),
      snapToIndex: (index: number) =>
        bottomSheetRef.current?.snapToIndex(index),
      snapToPosition: (position: string | number) =>
        bottomSheetRef.current?.snapToPosition(position),
      forceClose: () => bottomSheetRef.current?.forceClose(),
    }));

    const handleOptionSelect = (option: SelectOption) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setSelectedValue(option.value);
    };

    return (
      <BottomSheet
        ref={bottomSheetRef}
        backgroundStyle={{ backgroundColor: colors.background || "white" }}
      >
        <YStack gap="$2" padding="$4" flex={1}>
          {/* Header */}
          <YStack gap="$2">
            <Text
              textAlign="left"
              fontSize="$7"
              fontWeight="600"
              color="$foreground"
            >
              {title}
            </Text>
            <Text
              textAlign="left"
              color="$mutedForeground"
              fontSize="$4"
              lineHeight="$5"
            >
              {subtitle}
            </Text>
          </YStack>

          {/* Options List */}
          <YStack gap="$2" flex={1}>
            {options.map((option, index) => (
              <Pressable
                key={`${option.value}-${index}`}
                onPress={() => handleOptionSelect(option)}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <XStack
                  alignItems="center"
                  justifyContent="space-between"
                  borderRadius="$6"
                  paddingVertical="$2"
                >
                  <Text
                    fontSize="$5"
                    fontWeight="400"
                    color="$foreground"
                    flex={1}
                  >
                    {option.label}
                  </Text>
                  <ThemedIonicons
                    name={
                      option.value === selectedValue
                        ? "radio-button-on"
                        : "radio-button-off"
                    }
                    size={24}
                                      />
                </XStack>
              </Pressable>
            ))}
            <Button
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onSelect(selectedValue || "");
                bottomSheetRef.current?.dismiss();
              }}
              variant="primary"
              size="lg"
              fullWidth
              disabled={!selectedValue}
              borderRadius="$10"
              mt="$4"
            >
              Apply
            </Button>
          </YStack>
        </YStack>
      </BottomSheet>
    );
  }
);

SelectBottomSheet.displayName = "SelectBottomSheet";
