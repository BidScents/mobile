import { useEffect, useState } from "react";
import { Text, XStack, YStack } from "tamagui";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface CountdownTickerProps {
  endsAt: string;
}

export function CountdownTicker({ endsAt }: CountdownTickerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ 
    days: 0, 
    hours: 0, 
    minutes: 0, 
    seconds: 0 
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const endTime = new Date(endsAt).getTime();
      const difference = endTime - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endsAt]);

  const TimeUnit = ({ value, label }: { value: number; label: string }) => (
    <YStack alignItems="center" backgroundColor="$muted" borderRadius="$5" py="$3" px="$4" minWidth={60}>
      <Text fontSize="$7" fontWeight="700" color="$foreground">
        {value.toString().padStart(2, '0')}
      </Text>
      <Text fontSize="$4" color="$mutedForeground" fontWeight="500">
        {label}
      </Text>
    </YStack>
  );

  return (
    <XStack gap="$2" alignItems="center" justifyContent="space-between" pt="$4" pb="$2">
      <TimeUnit value={timeLeft.days} label="Days" />
      <TimeUnit value={timeLeft.hours} label="Hours" />
      <TimeUnit value={timeLeft.minutes} label="Mins" />
      <TimeUnit value={timeLeft.seconds} label="Secs" />
    </XStack>
  );
}
