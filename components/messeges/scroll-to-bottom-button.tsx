import * as Haptics from "expo-haptics";
import { useEffect, useRef } from "react";
import { Animated, Pressable } from "react-native";
import { View } from "tamagui";
import { ThemedIonicons } from "../ui/themed-icons";

interface ScrollToBottomButtonProps {
  visible: boolean;
  onPress: () => void;
}

export function ScrollToBottomButton({ visible, onPress }: ScrollToBottomButtonProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
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
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, scaleAnim]);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <Animated.View
      style={{
        position: 'absolute',
        bottom: 16,
        right: 16,
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }],
        zIndex: 1000,
      }}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <Pressable onPress={handlePress} hitSlop={16}>
        <View
          backgroundColor="$background"
          borderRadius="$10"
          padding="$2"
          alignItems="center"
          justifyContent="center"
        >
          <ThemedIonicons 
            name="chevron-down" 
            size={20} 
            themeColor="foreground"
          />
        </View>
      </Pressable>
    </Animated.View>
  );
}