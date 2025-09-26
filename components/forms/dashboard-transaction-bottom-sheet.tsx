import { AvatarIcon } from "@/components/ui/avatar-icon";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { ThemedIonicons } from "@/components/ui/themed-icons";
import { currency } from "@/constants/constants";
import { SellerTransactionData, TransactionStatus } from "@bid-scents/shared-sdk";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { router } from "expo-router";
import React, { forwardRef, useImperativeHandle, useState } from "react";
import { Text, View, XStack, YStack } from "tamagui";

export interface DashboardTransactionBottomSheetMethods {
  present: () => void;
  dismiss: () => void;
}

export interface DashboardTransactionBottomSheetProps {
  transaction: SellerTransactionData | null;
}

export const DashboardTransactionBottomSheet = forwardRef<
  DashboardTransactionBottomSheetMethods,
  DashboardTransactionBottomSheetProps
>(({ transaction }, ref) => {
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
          description: "Buyer is waiting for item to be delivered.",
          color: "$orange10",
          backgroundColor: "$orange3",
          icon: "cube-outline" as const,
        };
      case TransactionStatus.WAITING_REVIEW:
        return {
          label: "Waiting for Review",
          description: "Buyer has received the item and will leave a review.",
          color: "$blue10",
          backgroundColor: "$blue3",
          icon: "star-outline" as const,
        };
      case TransactionStatus.COMPLETED:
        return {
          label: "Completed",
          description: "Transaction completed. Funds have been released.",
          color: "$green10",
          backgroundColor: "$green3",
          icon: "checkmark-circle-outline" as const,
        };
      default:
        return {
          label: "Unknown Status",
          description: "Transaction status is unknown.",
          color: "$gray10",
          backgroundColor: "$gray3",
          icon: "help-circle-outline" as const,
        };
    }
  };

  const handleGoToConversation = () => {
    if (transaction?.conversation_id) {
      bottomSheetRef.current?.dismiss();
      router.push(`(screens)/(chat)/${transaction.conversation_id}` as any);
    }
  };

  const renderContent = () => {
    if (!isOpen || !transaction) {
      return (
        <YStack
          flex={1}
          justifyContent="center"
          alignItems="center"
          padding="$6"
        >
          <Text color="$mutedForeground">Opening transaction details...</Text>
        </YStack>
      );
    }

    const statusConfig = getStatusConfig(transaction.status);

    return (
      <YStack gap="$4" padding="$4" paddingBottom="$5">
        {/* Header */}
        <YStack gap="$2">
          <XStack alignItems="center" justifyContent="space-between" gap="$2">
            <Text fontSize="$7" fontWeight="600" color="$foreground">
              Transaction Details
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

        {/* Buyer Information */}
        <YStack gap="$3">
          <XStack alignItems="center" justifyContent="space-between" gap="$2">
            <Text fontSize="$6" fontWeight="600" color="$foreground">
              Buyer Information
            </Text>
            <XStack 
                alignItems="center" 
                hitSlop={20} 
                backgroundColor="$muted" 
                paddingHorizontal="$2" 
                paddingVertical="$1.5" 
                borderRadius="$5" 
                gap="$2" 
                onPress={() => (bottomSheetRef.current?.dismiss(), router.push(`/listing/${transaction.listing.id}`))}
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
          {transaction.buyer ? (
            <XStack
              alignItems="center"
              gap="$3"
              padding="$3"
              backgroundColor="$muted"
              borderRadius="$5"
              onPress={() => (bottomSheetRef.current?.dismiss(), router.push(`/profile/${transaction.buyer?.id}`))}
            >
              <AvatarIcon url={transaction.buyer.profile_image_url} size="$6" />
              <YStack flex={1}>
                <Text
                  fontSize="$5"
                  fontWeight="500"
                  color="$foreground"
                >
                  {transaction.buyer.username}
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
              Buyer information not available
            </Text>
          )}
        </YStack>

        {/* Payment Breakdown */}
        <YStack gap="$3">
          <Text fontSize="$6" fontWeight="600" color="$foreground">
            Payment Breakdown
          </Text>
          <YStack gap="$2" padding="$3" backgroundColor="$muted" borderRadius="$5">
            <XStack justifyContent="space-between" alignItems="center">
              <Text fontSize="$4" color="$mutedForeground">
                Item Price ({transaction.quantity}x)
              </Text>
              <Text fontSize="$4" fontWeight="500" color="$foreground">
                {currency} {((transaction.net_amount + transaction.platform_fee + transaction.stripe_fee) * transaction.quantity).toFixed(2)}
              </Text>
            </XStack>
            <XStack justifyContent="space-between" alignItems="center">
              <Text fontSize="$4" color="$mutedForeground">
                Platform Fee
              </Text>
              <Text fontSize="$4" fontWeight="500" color="$red10">
                -{currency} {transaction.platform_fee.toFixed(2)}
              </Text>
            </XStack>
            <XStack justifyContent="space-between" alignItems="center">
              <Text fontSize="$4" color="$mutedForeground">
                Stripe Fee
              </Text>
              <Text fontSize="$4" fontWeight="500" color="$red10">
                -{currency} {transaction.stripe_fee.toFixed(2)}
              </Text>
            </XStack>
            <View height={1} backgroundColor="$borderColor" marginVertical="$2" />
            <XStack justifyContent="space-between" alignItems="center">
              <Text fontSize="$5" fontWeight="600" color="$foreground">
                Net Amount
              </Text>
              <Text fontSize="$5" fontWeight="600" color="$green11">
                {currency} {transaction.net_amount.toFixed(2)}
              </Text>
            </XStack>
          </YStack>
        </YStack>

        {/* Action Buttons */}
        <YStack gap="$3" marginTop="$2">
          <Button
            variant="primary"
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
      snapPoints={["90%"]}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      enableDynamicSizing={true}
    >
      {renderContent()}
    </BottomSheet>
  );
});

DashboardTransactionBottomSheet.displayName = "DashboardTransactionBottomSheet";