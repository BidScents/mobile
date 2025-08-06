import React, { useEffect, useState } from "react";
import { Text, XStack } from "tamagui";
import {
  TimeLeft,
  calculateTimeLeft,
  formatTimeLeft,
} from "../../utils/countdown";

interface CountdownTimerProps {
  endTime: string; // ISO string
  onExpired?: () => void;
  size?: "small" | "medium" | "large";
}

/**
 * Live countdown timer that updates every second until auction ends.
 * Shows "Ended" when time is up and triggers callback.
 */
export function CountdownTimer({
  endTime,
  onExpired,
  size = "medium",
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [hasEnded, setHasEnded] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const time = calculateTimeLeft(endTime);

      if (!time) {
        setHasEnded(true);
        setTimeLeft(null);
        onExpired?.();
      } else {
        setTimeLeft(time);
      }
    };

    // Initial calculation
    updateTimer();

    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [endTime, onExpired]);

  const textSize = {
    small: "$2",
    medium: "$3",
    large: "$4",
  }[size];

  if (hasEnded) {
    return (
      <XStack
        backgroundColor="$muted"
        alignItems="center"
        borderRadius="$5"
        paddingHorizontal="$2"
        paddingVertical="$2"
      >
        <Text fontSize={textSize} color="$foreground" fontWeight="500">
          Ended
        </Text>
      </XStack>
    );
  }

  if (!timeLeft) {
    return (
      <XStack
        backgroundColor="$muted"
        alignItems="center"
        borderRadius="$5"
        paddingHorizontal="$2"
        paddingVertical="$2"
      >
        <Text fontSize={textSize} color="$mutedForeground">
          Loading...
        </Text>
      </XStack>
    );
  }

  return (
    <XStack
      backgroundColor="$muted"
      alignItems="center"
      borderRadius="$5"
      paddingHorizontal="$2"
      paddingVertical="$2"
    >
      <Text fontSize={textSize} color="$foreground" fontWeight="500">
        {formatTimeLeft(timeLeft)}
      </Text>
    </XStack>
  );
}
