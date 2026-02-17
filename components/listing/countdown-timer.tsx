import React, { useEffect, useRef, useState } from "react";
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
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(() =>
    calculateTimeLeft(endTime)
  );
  const wasExpiredRef = useRef<boolean>(timeLeft === null);

  useEffect(() => {
    const updateTimer = () => {
      const time = calculateTimeLeft(endTime);
      const hasExpired = time === null;

      if (hasExpired && !wasExpiredRef.current) {
        onExpired?.();
      }

      wasExpiredRef.current = hasExpired;
      setTimeLeft(time);
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

  if (!timeLeft) {
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
