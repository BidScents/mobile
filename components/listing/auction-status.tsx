import { Text, XStack } from "tamagui";

interface AuctionStatusProps {
  status: string;
}

export function AuctionStatus({ status }: AuctionStatusProps) {
  return (
    <XStack
      alignItems="center"
      gap="$2"
      backgroundColor="$muted"
      borderRadius="$5"
      py="$2"
      px="$3"
    >
      <Text fontSize="$5" fontWeight="500" color="$foreground">
        {status}
      </Text>
    </XStack>
  );
}
