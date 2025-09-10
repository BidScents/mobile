import { StripeSetupPaymentMethod } from "@/components/payments/stripe-setup-payment-method";
import { Button as ButtonUI } from "@/components/ui/button";
import { ThemedIonicons } from "@/components/ui/themed-icons";
import {
  useDeletePaymentMethod,
  useGetPaymentMethod,
  useUpdatePaymentMethod,
} from "@/hooks/queries/use-payments";
import { useLoadingStore } from "@bid-scents/shared-sdk";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";
import { Spinner, Text, XStack, YStack } from "tamagui";

interface PaymentMethodSectionProps {
  hasPaymentMethod: boolean;
  isSubscriptionActive: boolean;
}

// Helper function to format card display
function formatCardDisplay(brand: string, last4: string): string {
  return `•••• •••• •••• ${last4}`;
}

export function PaymentMethodSection({
  hasPaymentMethod,
  isSubscriptionActive,
}: PaymentMethodSectionProps) {
  const [showUpdatePayment, setShowUpdatePayment] = useState(false);
  const [showEditMethod, setShowEditMethod] = useState(false);
  const { showLoading, hideLoading } = useLoadingStore();

  const { data: paymentMethod, isLoading, isError } = useGetPaymentMethod();
  const deletePaymentMethodMutation = useDeletePaymentMethod();
  const updatePaymentMethodMutation = useUpdatePaymentMethod();

  const handleDeletePaymentMethod = () => {
    if (isSubscriptionActive) {
      Alert.alert(
        "Cannot Delete Payment Method",
        "You cannot delete your payment method while your subscription is active. Please cancel your subscription first.",
        [{ text: "OK", style: "default" }]
      );
      return;
    }

    Alert.alert(
      "Delete Payment Method",
      "Are you sure you want to delete your payment method? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            showLoading();
            try {
              await deletePaymentMethodMutation.mutateAsync();
              hideLoading();
              Alert.alert("Success", "Your payment method has been deleted.");
            } catch (error: any) {
              hideLoading();
              Alert.alert(
                "Error",
                `Failed to delete payment method: ${
                  error?.message || "Unknown error"
                }`
              );
            }
          },
        },
      ]
    );
  };

  const handleUpdatePaymentMethod = () => {
    setShowUpdatePayment(true);
  };

  const handleUpdateSuccess = async (paymentMethodId: string) => {
    setShowUpdatePayment(false);
    showLoading();

    try {
      await updatePaymentMethodMutation.mutateAsync(paymentMethodId);
      hideLoading();
      Alert.alert("Success", "Your payment method has been updated.");
    } catch (error: any) {
      hideLoading();
      Alert.alert(
        "Update Failed",
        `Failed to update payment method: ${error?.message || "Unknown error"}`
      );
    }
  };

  const handleUpdateError = (error: Error) => {
    setShowUpdatePayment(false);

    // Don't show alert for user cancellation
    if (error.message !== "USER_CANCELLED") {
      Alert.alert("Update Failed", error.message);
    }
  };

  const handleAddPaymentMethod = () => {
    router.push("/(screens)/subscription-paywall");
  };

  const handleEditPaymentMethod = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowEditMethod(!showEditMethod);
  };

  return (
    <>
      <YStack gap="$3">
        <XStack alignItems="center" justifyContent="space-between">
          <Text fontSize="$5" fontWeight="500" color="$foreground">
            Payment Method
          </Text>
          <XStack
            alignItems="center"
            backgroundColor="$muted"
            borderRadius="$5"
            px="$3"
            py="$2"
            onPress={handleEditPaymentMethod}
          >
            <Text fontSize="$3" fontWeight="500" color="$foreground">
              Edit
            </Text>
          </XStack>
        </XStack>
        <YStack backgroundColor="$muted" borderRadius="$6" px="$4" py="$4">
          {hasPaymentMethod ? (
            <YStack gap="$3">
              {/* Payment Method Details */}
              {isLoading ? (
                <XStack alignItems="center" gap="$3">
                  <Spinner size="small" />
                  <Text fontSize="$4" color="$mutedForeground">
                    Loading payment method...
                  </Text>
                </XStack>
              ) : isError ? (
                <XStack alignItems="center" gap="$3">
                  <ThemedIonicons
                    name="alert-circle-outline"
                    size={20}
                    color="$orange10"
                  />
                  <YStack flex={1}>
                    <Text fontSize="$4" color="$foreground">
                      Payment method on file
                    </Text>
                    <Text fontSize="$3" color="$mutedForeground">
                      Unable to load card details
                    </Text>
                  </YStack>
                </XStack>
              ) : paymentMethod ? (
                <XStack alignItems="center" gap="$3">
                  <ThemedIonicons
                    name="card-outline"
                    size={20}
                    themeColor="foreground"
                  />
                  <YStack flex={1}>
                    <Text
                      fontSize="$4"
                      color="$foreground"
                      textTransform="capitalize"
                    >
                      {paymentMethod.brand}{" "}
                      {formatCardDisplay(
                        paymentMethod.brand,
                        paymentMethod.last4
                      )}
                    </Text>
                    <Text fontSize="$3" color="$mutedForeground">
                      Primary payment method
                    </Text>
                  </YStack>
                </XStack>
              ) : (
                <XStack alignItems="center" gap="$3">
                  <ThemedIonicons
                    name="card-outline"
                    size={20}
                    themeColor="foreground"
                  />
                  <YStack flex={1}>
                    <Text fontSize="$4" color="$foreground">
                      Payment method on file
                    </Text>
                    <Text fontSize="$3" color="$mutedForeground">
                      Details not available
                    </Text>
                  </YStack>
                </XStack>
              )}

              {/* Payment Method Actions */}
              {showEditMethod && (
                <XStack gap="$3">
                  <ButtonUI
                    size="sm"
                    variant="primary"
                    onPress={handleUpdatePaymentMethod}
                    disabled={updatePaymentMethodMutation.isPending}
                    flex={1}
                  >
                    {updatePaymentMethodMutation.isPending
                      ? "Updating..."
                      : "Update"}
                  </ButtonUI>

                  <ButtonUI
                    size="sm"
                    variant="destructive"
                    onPress={handleDeletePaymentMethod}
                    disabled={
                      deletePaymentMethodMutation.isPending ||
                      isSubscriptionActive
                    }
                    flex={1}
                  >
                    {deletePaymentMethodMutation.isPending
                      ? "Deleting..."
                      : "Delete"}
                  </ButtonUI>
                </XStack>
              )}
              {isSubscriptionActive && showEditMethod && (
                <Text fontSize="$2" color="$mutedForeground" textAlign="center">
                  Cancel subscription to delete payment method
                </Text>
              )}
            </YStack>
          ) : (
            <XStack alignItems="center" gap="$3">
              <ThemedIonicons
                name="card-outline"
                size={20}
                color="$mutedForeground"
              />
              <YStack flex={1}>
                <Text fontSize="$4" color="$mutedForeground">
                  No payment method
                </Text>
                <Text fontSize="$3" color="$mutedForeground">
                  Add a payment method to subscribe
                </Text>
              </YStack>
              <ButtonUI
                size="sm"
                variant="outline"
                onPress={handleAddPaymentMethod}
              >
                Add
              </ButtonUI>
            </XStack>
          )}
        </YStack>
      </YStack>

      {/* Payment Method Update Modal */}
      {showUpdatePayment && (
        <StripeSetupPaymentMethod
          onSuccess={handleUpdateSuccess}
          onError={handleUpdateError}
        />
      )}
    </>
  );
}
