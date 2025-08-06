import { useEffect, useState } from "react";
import { Text, XStack, YStack } from "tamagui";
import {
  TimeLeft,
  calculateTimeLeft,
  createZeroTimeLeft,
  getDynamicLabel,
} from "../../utils/countdown";

interface CountdownTickerProps {
  endsAt: string;
}

export function CountdownTicker({ endsAt }: CountdownTickerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(createZeroTimeLeft());

  useEffect(() => {
    const updateTimeLeft = () => {
      const time = calculateTimeLeft(endsAt);
      setTimeLeft(time || createZeroTimeLeft());
    };

    updateTimeLeft();
    const timer = setInterval(updateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endsAt]);

  const TimeUnit = ({ value, label }: { value: number; label: string }) => (
    <YStack
      alignItems="center"
      backgroundColor="$muted"
      borderRadius="$5"
      py="$3"
      px="$4"
      minWidth={60}
    >
      <Text fontSize="$7" fontWeight="700" color="$foreground">
        {value.toString().padStart(2, "0")}
      </Text>
      <Text fontSize="$4" color="$mutedForeground" fontWeight="500">
        {getDynamicLabel(value, label)}
      </Text>
    </YStack>
  );

  return (
    <XStack
      gap="$2"
      alignItems="center"
      justifyContent="space-between"
      pt="$4"
      pb="$2"
    >
      <TimeUnit value={timeLeft.days} label="Days" />
      <TimeUnit value={timeLeft.hours} label="Hours" />
      <TimeUnit value={timeLeft.minutes} label="Mins" />
      <TimeUnit value={timeLeft.seconds} label="Secs" />
    </XStack>
  );
}
