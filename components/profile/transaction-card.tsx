import { currency } from "@/constants/constants";
import { SellerTransactionData, TransactionStatus } from "@bid-scents/shared-sdk";
import FastImage from "@d11/react-native-fast-image";
import { Text, View, YStack } from "tamagui";
import { ThemedIonicons } from "../ui/themed-icons";

interface TransactionCardProps {
  transaction: SellerTransactionData;
  onPress: () => void;
}

export function TransactionCard({ transaction, onPress }: TransactionCardProps) {
  const getStatusConfig = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.WAITING_DELIVERY:
        return {
          label: "Awaiting Delivery",
          color: "$orange10",
          backgroundColor: "$orange3",
          icon: "cube-outline" as const,
        };
      case TransactionStatus.WAITING_REVIEW:
        return {
          label: "Awaiting Review",
          color: "$blue10",
          backgroundColor: "$blue3",
          icon: "star-outline" as const,
        };
      case TransactionStatus.COMPLETED:
        return {
          label: "Completed",
          color: "$green10",
          backgroundColor: "$green3",
          icon: "checkmark-circle-outline" as const,
        };
      default:
        return {
          label: "Unknown",
          color: "$gray10",
          backgroundColor: "$gray3",
          icon: "help-circle-outline" as const,
        };
    }
  };

  const statusConfig = getStatusConfig(transaction.status);

  return (
    <YStack 
      onPress={onPress}
      backgroundColor="$background"
      borderRadius="$6"
      pressStyle={{ scale: 0.98 }}
      gap="$2"
    >
      <View position="relative">
        <FastImage
          source={{
            uri: `${process.env.EXPO_PUBLIC_IMAGE_BASE_URL}${transaction.listing.image_url}`,
          }}
          style={{
            width: "100%",
            aspectRatio: 1,
            borderRadius: 10,
            backgroundColor: "$gray2",
          }}
        />
        
        {/* Status Badge */}
        <View
          position="absolute"
          top="$2"
          right="$2"
          backgroundColor={statusConfig.backgroundColor}
          borderRadius="$3"
          paddingHorizontal="$2"
          paddingVertical="$1.5"
          flexDirection="row"
          alignItems="center"
          gap="$1"
        >
          <ThemedIonicons
            name={statusConfig.icon}
            size={14}
            color={statusConfig.color}
          />
          <Text
            fontSize="$3"
            fontWeight="500"
            color={statusConfig.color}
          >
            {statusConfig.label}
          </Text>
        </View>

        {/* Listing Name and Net Amount */}
        <View
          gap="$1"
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          padding="$2"
          backgroundColor="$muted"
          borderRadius="$5"
          marginTop="$2"
        >
          <Text
            borderRadius="$3"
            fontSize="$4" 
            fontWeight="500" 
            color="$foreground"
            numberOfLines={1}
          >
            {transaction.listing.name}
          </Text>
          <Text
            borderRadius="$3"
            fontSize="$3" 
            fontWeight="600" 
            color="$foreground"
            numberOfLines={1}
          >
            {currency} {transaction.net_amount.toFixed(2)}
          </Text>
        </View>
      </View>
    </YStack>
  );
}