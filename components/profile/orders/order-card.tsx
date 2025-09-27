import { currency } from "@/constants/constants";
import { BuyerTransactionData, TransactionStatus } from "@bid-scents/shared-sdk";
import FastImage from "@d11/react-native-fast-image";
import { Text, View, XStack, YStack } from "tamagui";
import { ThemedIonicons } from "../../ui/themed-icons";

interface OrderCardProps {
  order: BuyerTransactionData;
  onPress: () => void;
}

export function OrderCard({ order, onPress }: OrderCardProps) {
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

  const statusConfig = getStatusConfig(order.status);

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
            uri: order.listing.image_url 
              ? `${process.env.EXPO_PUBLIC_IMAGE_BASE_URL}${order.listing.image_url}`
              : undefined,
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

        {/* Order Info */}
        <YStack
          gap="$2"
          padding="$2"
          backgroundColor="$muted"
          borderRadius="$5"
          marginTop="$2"
        >
          {/* Listing Name and Price */}
          <XStack
            alignItems="center"
            justifyContent="space-between"
          >
            <Text
              fontSize="$4" 
              fontWeight="500" 
              color="$foreground"
              numberOfLines={1}
              flex={1}
            >
              {order.listing.name}
            </Text>
            <Text
              fontSize="$3" 
              fontWeight="600" 
              color="$foreground"
              marginLeft="$2"
            >
              {currency} {order.price.toFixed(2)}
            </Text>
          </XStack>
          
          {/* Seller Info and Quantity */}
          <XStack
            alignItems="center"
            justifyContent="space-between"
          >
            <XStack alignItems="center" gap="$2" flex={1}>
              {order.seller?.profile_image_url && (
                <FastImage
                  source={{
                    uri: `${process.env.EXPO_PUBLIC_IMAGE_BASE_URL}${order.seller.profile_image_url}`,
                  }}
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                  }}
                />
              )}
              <Text
                fontSize="$3"
                color="$mutedForeground"
                numberOfLines={1}
                flex={1}
              >
                {order.seller?.username || 'Unknown Seller'}
              </Text>
            </XStack>
            <Text
              fontSize="$3"
              color="$mutedForeground"
            >
              Qty: {order.quantity}
            </Text>
          </XStack>
        </YStack>
      </View>
    </YStack>
  );
}