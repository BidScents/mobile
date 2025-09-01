import React, { useEffect, useRef } from "react";
import { Animated } from "react-native";
import { Spinner, Text, View } from "tamagui";

interface ScrollLoadingIndicatorProps {
  visible: boolean;
}

export const ScrollLoadingIndicator = React.memo(({ visible }: ScrollLoadingIndicatorProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(translateAnim, {
          toValue: -20,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, translateAnim]);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 16,
        left: 0,
        right: 0,
        opacity: fadeAnim,
        transform: [{ translateY: translateAnim }],
        zIndex: 1000,
        alignItems: 'center',
      }}
      pointerEvents="none"
    >
      <View
        backgroundColor="$background"
        borderColor="$borderColor"
        borderWidth={1}
        borderRadius="$6"
        paddingHorizontal="$4"
        paddingVertical="$2"
        flexDirection="row"
        alignItems="center"
      >
        <Spinner size="small" color="$mutedForeground" marginRight="$2" />
        <Text fontSize="$2" color="$mutedForeground">
          Loading older messages...
        </Text>
      </View>
    </Animated.View>
  );
});

ScrollLoadingIndicator.displayName = 'ScrollLoadingIndicator';