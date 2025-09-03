import { useThemeColors } from "@/hooks/use-theme-colors";
import { ConversationType, TypingResData } from "@bid-scents/shared-sdk";
import { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";
import { Avatar, Text, View, XStack, YStack } from "tamagui";

interface TypingIndicatorItemProps {
  typingUsers: TypingResData[];
  conversationType: ConversationType;
  showAvatar?: boolean;
}

export function TypingIndicatorItem({
  typingUsers,
  conversationType,
  showAvatar = false,
}: TypingIndicatorItemProps) {
  // Animation values for the three dots (always declare hooks first)
  const dot1Opacity = useRef(new Animated.Value(0.3)).current;
  const dot2Opacity = useRef(new Animated.Value(0.3)).current;
  const dot3Opacity = useRef(new Animated.Value(0.3)).current;
  const { mutedForeground } = useThemeColors();

  useEffect(() => {
    // Only start animation if there are typing users
    if (typingUsers.length === 0) {
      return;
    }

    const createDotAnimation = (animatedValue: Animated.Value, delay: number) => {
      return Animated.sequence([
        Animated.delay(delay),
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0.3,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]);
    };

    const animationLoop = Animated.loop(
      Animated.parallel([
        createDotAnimation(dot1Opacity, 0),
        createDotAnimation(dot2Opacity, 200),
        createDotAnimation(dot3Opacity, 400),
      ]),
      { iterations: -1 }
    );

    animationLoop.start();

    return () => animationLoop.stop();
  }, [dot1Opacity, dot2Opacity, dot3Opacity, typingUsers.length]);

  // Don't render anything if no one is typing (after hooks)
  if (typingUsers.length === 0) {
    return null;
  }

  // Get the first typing user for avatar (in group conversations)
  const firstTypingUser = typingUsers[0];

  // Generate typing text based on conversation type
  const getTypingText = () => {
    if (conversationType === ConversationType.DIRECT) {
      return "typing";
    }

    // For group conversations, show usernames
    if (typingUsers.length === 1) {
      return `${typingUsers[0].user.username} is typing`;
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0].user.username} and ${typingUsers[1].user.username} are typing`;
    } else {
      return `${typingUsers[0].user.username} and ${typingUsers.length - 1} others are typing`;
    }
  };

  const AnimatedDot = ({ animatedValue }: { animatedValue: Animated.Value }) => (
    <Animated.View
      style={{
        opacity: animatedValue,
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: mutedForeground,
        marginHorizontal: 1,
      }}
    />
  );

  return (
    <View pt="$3">
      <XStack justifyContent="flex-start">
        {/* Show avatar only in group conversations */}
        {showAvatar && conversationType !== ConversationType.DIRECT && (
          <Avatar circular size="$2" marginRight="$2">
            <Avatar.Image
              source={{
                uri: firstTypingUser.user.profile_image_url || undefined,
              }}
            />
            <Avatar.Fallback backgroundColor="$muted">
              <Text fontSize="$2" fontWeight="600" color="$mutedForeground">
                {firstTypingUser.user.username?.charAt(0).toUpperCase() || "U"}
              </Text>
            </Avatar.Fallback>
          </Avatar>
        )}

        {/* Typing indicator bubble */}
        <YStack maxWidth="80%" alignItems="flex-start">
          <View
            backgroundColor="$muted"
            paddingVertical="$2.5"
            paddingHorizontal="$3"
            borderRadius="$5"
            borderBottomLeftRadius="$2"
          >
            <XStack alignItems="center" gap="$2">
              <Text fontSize="$3" color="$mutedForeground" fontStyle="italic">
                {getTypingText()}
              </Text>
              
              {/* Animated dots */}
              <XStack alignItems="center" gap="$0.5">
                <AnimatedDot animatedValue={dot1Opacity} />
                <AnimatedDot animatedValue={dot2Opacity} />
                <AnimatedDot animatedValue={dot3Opacity} />
              </XStack>
            </XStack>
          </View>
        </YStack>
      </XStack>
    </View>
  );
}