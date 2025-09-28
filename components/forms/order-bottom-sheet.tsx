import { AvatarIcon } from "@/components/ui/avatar-icon";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { ThemedIonicons } from "@/components/ui/themed-icons";
import { currency } from "@/constants/constants";
import { BuyerTransactionData, TransactionStatus } from "@bid-scents/shared-sdk";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { router } from "expo-router";
import React, { forwardRef, useImperativeHandle, useState } from "react";
import { Text, View, XStack, YStack } from "tamagui";

export interface OrderBottomSheetMethods {
  present: () => void;
  dismiss: () => void;
}

export interface OrderBottomSheetProps {
  order: BuyerTransactionData | null;
  onConfirmReceipt?: (orderId: string) => void;
  onLeaveReview?: (orderId: string) => void;
}

export const OrderBottomSheet = forwardRef<
  OrderBottomSheetMethods,
  OrderBottomSheetProps
>(({ order, onConfirmReceipt, onLeaveReview }, ref) => {
  const bottomSheetRef = React.useRef<BottomSheetModalMethods>(null);
  const [isOpen, setIsOpen] = useState(false);

  useImperativeHandle(ref, () => ({
    present: () => {
      setIsOpen(true);
      bottomSheetRef.current?.present();
    },
    dismiss: () => {
      bottomSheetRef.current?.dismiss();
      setIsOpen(false);
    },
  }));

  const getStatusConfig = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.WAITING_DELIVERY:
        return {
          label: "Waiting for Delivery",
          description: "Seller is preparing your item for delivery.",
          color: "$orange10",
          backgroundColor: "$orange3",
          icon: "cube-outline" as const,
        };
      case TransactionStatus.WAITING_REVIEW:
        return {
          label: "Waiting for Review",
          description: "Item delivered! Please confirm receipt and leave a review.",
          color: "$blue10",
          backgroundColor: "$blue3",
          icon: "star-outline" as const,
        };
      case TransactionStatus.COMPLETED:
        return {
          label: "Completed",
          description: "Order completed successfully.",
          color: "$green10",
          backgroundColor: "$green3",
          icon: "checkmark-circle-outline" as const,
        };
      default:
        return {
          label: "Unknown Status",
          description: "Order status is unknown.",
          color: "$gray10",
          backgroundColor: "$gray3",
          icon: "help-circle-outline" as const,
        };
    }
  };

  const handleGoToConversation = () => {
    if (order?.conversation_id) {
      bottomSheetRef.current?.dismiss();
      router.push(`(screens)/(chat)/${order.conversation_id}` as any);
    }
  };

  const handleConfirmReceipt = () => {
    if (order?.id) {
      onConfirmReceipt?.(order.id);
      bottomSheetRef.current?.dismiss();
    }
  };

  const handleLeaveReview = () => {
    if (order?.id) {
      onLeaveReview?.(order.id);
      bottomSheetRef.current?.dismiss();
    }
  };

  const renderContent = () => {
    if (!isOpen || !order) {
      return (
        <YStack
          flex={1}
          justifyContent="center"
          alignItems="center"
          padding="$6"
        >
          <Text color="$mutedForeground">Opening order details...</Text>
        </YStack>
      );
    }

    const statusConfig = getStatusConfig(order.status);

    return (
      <YStack gap="$4" padding="$4" paddingBottom="$5">
        {/* Header */}
        <YStack gap="$2">
          <XStack alignItems="center" justifyContent="space-between" gap="$2">
            <Text fontSize="$7" fontWeight="600" color="$foreground">
              Order Details
            </Text>
            <View
              backgroundColor={statusConfig.backgroundColor}
              borderRadius="$5"
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
          </XStack>

          <Text
            fontSize="$4"
            color="$mutedForeground"
            opacity={0.8}
          >
            {statusConfig.description}
          </Text>
        </YStack>

        {/* Seller Information */}
        <YStack gap="$3">
          <XStack alignItems="center" justifyContent="space-between" gap="$2">
            <Text fontSize="$6" fontWeight="600" color="$foreground">
              Seller Information
            </Text>
            <XStack 
                alignItems="center" 
                hitSlop={20} 
                backgroundColor="$muted" 
                paddingHorizontal="$2" 
                paddingVertical="$1.5" 
                borderRadius="$5" 
                gap="$2" 
                onPress={() => (bottomSheetRef.current?.dismiss(), router.push(`/listing/${order.listing.id}`))}
              >
                <Text fontSize="$3" fontWeight="500" color="$foreground">
                  View Listing
                </Text>
                <ThemedIonicons
                  name="navigate-circle"
                  size={18}
                  color="$mutedForeground"
                />
            </XStack>
          </XStack>
          {order.seller ? (
            <XStack
              alignItems="center"
              gap="$3"
              padding="$3"
              backgroundColor="$muted"
              borderRadius="$5"
              onPress={() => (bottomSheetRef.current?.dismiss(), router.push(`/profile/${order.seller?.id}`))}
            >
              <AvatarIcon url={order.seller.profile_image_url} size="$6" />
              <YStack flex={1}>
                <Text
                  fontSize="$5"
                  fontWeight="500"
                  color="$foreground"
                >
                  {order.seller.username}
                </Text>
              </YStack>
              <ThemedIonicons
                name="chevron-forward"
                size={20}
                color="$mutedForeground"
              />
            </XStack>
          ) : (
            <Text color="$mutedForeground" fontSize="$4">
              Seller information not available
            </Text>
          )}
        </YStack>

        {/* Order Breakdown */}
        <YStack gap="$3">
          <Text fontSize="$6" fontWeight="600" color="$foreground">
            Order Breakdown
          </Text>
          <YStack gap="$2" padding="$3" backgroundColor="$muted" borderRadius="$5">
            <XStack justifyContent="space-between" alignItems="center">
              <Text fontSize="$4" color="$mutedForeground">
                Item: {order.listing.name}
              </Text>
            </XStack>
            <XStack justifyContent="space-between" alignItems="center">
              <Text fontSize="$4" color="$mutedForeground">
                Unit Price
              </Text>
              <Text fontSize="$4" fontWeight="500" color="$foreground">
                {currency} {((order.price) / order.quantity).toFixed(2)}
              </Text>
            </XStack>
            <XStack justifyContent="space-between" alignItems="center">
              <Text fontSize="$4" color="$mutedForeground">
                Quantity
              </Text>
              <Text fontSize="$4" fontWeight="500" color="$foreground">
                {order.quantity}
              </Text>
            </XStack>
            <View height={1} backgroundColor="$borderColor" marginVertical="$2" />
            <XStack justifyContent="space-between" alignItems="center">
              <Text fontSize="$5" fontWeight="600" color="$foreground">
                Total Amount
              </Text>
              <Text fontSize="$5" fontWeight="600" color="$green11">
                {currency} {order.price.toFixed(2)}
              </Text>
            </XStack>
          </YStack>
        </YStack>

        {/* Action Buttons */}
        <YStack gap="$3" marginTop="$2">
          {order.status === TransactionStatus.WAITING_REVIEW && (
            <>
              <Button
                variant="primary"
                size="lg"
                onPress={handleConfirmReceipt}
                borderRadius="$5"
              >
                Confirm Receipt
              </Button>
              <Button
                variant="outline"
                size="lg"
                onPress={handleLeaveReview}
                borderRadius="$5"
              >
                Leave Review
              </Button>
            </>
          )}
          
          <Button
            variant={order.status === TransactionStatus.WAITING_REVIEW ? "outline" : "primary"}
            size="lg"
            onPress={handleGoToConversation}
            borderRadius="$5"
          >
            Go to Conversation
          </Button>
        </YStack>
      </YStack>
    );
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      enableDynamicSizing={true}
    >
      {renderContent()}
    </BottomSheet>
  );
});

OrderBottomSheet.displayName = "OrderBottomSheet";