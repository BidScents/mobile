import { Container } from "@/components/ui/container";
import { useThemeSettings } from "@/hooks/use-theme-settings";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import { LayoutChangeEvent, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Text, XStack, YStack } from "tamagui";
import { useThemeColors } from '../../../../hooks/use-theme-colors';

const options = [
  { label: "System", value: "system" },
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
];

export default function ThemeScreen() {
  const { themePreference, setTheme } = useThemeSettings();
  const colors = useThemeColors();
  const selectedIndex = useSharedValue(
    options.findIndex((opt) => opt.value === themePreference)
  );
  const [segmentWidth, setSegmentWidth] = useState(0);
  const translateX = useSharedValue(0);

  useEffect(() => {
    const currentIndex = options.findIndex(
      (opt) => opt.value === themePreference
    );
    selectedIndex.value = currentIndex;

    if (segmentWidth > 0) {
      translateX.value = withSpring(currentIndex * segmentWidth, {
        damping: 15,
        stiffness: 150,
        mass: 1,
      });
    }
  }, [themePreference, segmentWidth, selectedIndex, translateX]);

  const handleThemeChange = (value: string, index: number) => {
    if (value === "system" || value === "light" || value === "dark") {
      selectedIndex.value = index;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      translateX.value = withSpring(index * segmentWidth, {
        damping: 50,
        stiffness: 150,
        mass: 1,
      });
      setTheme(value);
    }
  };

  const onContainerLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    const newSegmentWidth = (width - 8) / 3; // Subtract padding and divide by 3
    setSegmentWidth(newSegmentWidth);

    // Update position immediately when layout changes
    const currentIndex = options.findIndex(
      (opt) => opt.value === themePreference
    );
    translateX.value = currentIndex * newSegmentWidth;
  };

  const indicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: translateX.value,
        },
      ],
    };
  });

  return (
    <Container variant="padded" safeArea={false}>
      <YStack alignItems="center" paddingTop="$6">
        <XStack
          position="relative"
          backgroundColor="$background"
          borderRadius="$8"
          padding="$1"
          borderWidth={1}
          borderColor="$borderColor"
          width="100%"
          maxWidth={320}
          onLayout={onContainerLayout}
        >
          <Animated.View
            style={[
              {
                position: "absolute",
                top: 4,
                left: 4,
                bottom: 4,
                backgroundColor: colors.foreground,
                borderRadius: 24,
                width: segmentWidth,
              },
              indicatorStyle,
            ]}
          />

          {options.map((option, index) => (
            <Pressable
              key={option.value}
              onPress={() => handleThemeChange(option.value, index)}
              style={{
                flex: 1,
                zIndex: 1,
              }}
            >
              <XStack
                alignItems="center"
                justifyContent="center"
                paddingVertical="$3"
                paddingHorizontal="$4"
              >
                <Text
                  fontSize="$4"
                  fontWeight="600"
                  color={
                    option.value === themePreference ? "$background" : "$color"
                  }
                  textAlign="center"
                >
                  {option.label}
                </Text>
              </XStack>
            </Pressable>
          ))}
        </XStack>
      </YStack>
    </Container>
  );
}
