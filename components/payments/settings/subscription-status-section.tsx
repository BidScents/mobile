import { Button as ButtonUI } from "@/components/ui/button";
import { useCancelSubscription } from "@/hooks/queries/use-payments";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Linking } from "react-native";
import { Text, XStack, YStack } from "tamagui";

interface SubscriptionStatusSectionProps {
  isActive: boolean;
  isSwapActive: boolean;
  planType: string | null;
  swapAccessUntil: Date | null;
  isRevenueCat?: boolean;
  managementURL?: string | null;
}

export function SubscriptionStatusSection({
  isActive,
  isSwapActive,
  planType,
  swapAccessUntil,
  isRevenueCat,
  managementURL,
}: SubscriptionStatusSectionProps) {
  const [showEditSubscription, setShowEditSubscription] = useState(false);
  const cancelSubscriptionMutation = useCancelSubscription();
  
  const handleUpgradeSubscription = useCallback(() => {
    router.push("/(screens)/subscription-paywall");
  }, []);

  const handleCancelSubscription = useCallback(() => {
    Alert.alert(
      "Cancel Subscription",
      "Are you sure you want to cancel your subscription? You will lose access to swap listings and boost credits.",
      [
        { text: "Keep Subscription", style: "cancel" },
        {
          text: "Cancel Subscription",
          style: "destructive",
          onPress: async () => {
            try {
              await cancelSubscriptionMutation.mutateAsync();
              Alert.alert(
                "Subscription Cancelled",
                "Your subscription has been cancelled. You will retain access until your next billing date."
              );
            } catch (error) {
              Alert.alert(
                "Cancellation Failed",
                "Failed to cancel subscription. Please try again or contact support."
              );
            }
          },
        },
      ]
    );
  }, [cancelSubscriptionMutation]);

  const handleUpgradeWithCheck = () => {
    // If user has swap access but subscription is not active, prevent new subscription
    if (isSwapActive && !isActive) {
      Alert.alert(
        "Cannot Create Subscription",
        "You still have active swap access from a previous subscription. You cannot create a new subscription until your current access expires.",
        [{ text: "OK", style: "default" }]
      );
      return;
    }
    
    handleUpgradeSubscription();
  };

  const handleEditSubscription = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowEditSubscription(!showEditSubscription);
  };

  const handleManageRevenueCatSubscription = useCallback(() => {
    if (managementURL) {
      Linking.openURL(managementURL).catch((error) => {
        console.error('Failed to open management URL:', error);
        Alert.alert(
          "Error",
          "Failed to open subscription management. Please try again."
        );
      });
    } else {
      Alert.alert(
        "Error", 
        "Subscription management not available. Please contact support."
      );
    }
  }, [managementURL]);

  // Active recurring subscription
  if (isActive) {
    return (
      <YStack gap="$3">
        <XStack alignItems="center" justifyContent="space-between">
          <Text fontSize="$5" fontWeight="500" color="$foreground">
            Active Subscription
          </Text>
          {isRevenueCat ? (
            <XStack alignItems="center" backgroundColor="$muted" borderRadius="$5" px="$3" py="$2" onPress={handleManageRevenueCatSubscription}>
              <Text fontSize="$3" fontWeight="500" color="$foreground">
                Manage
              </Text>
            </XStack>
          ) : (
            <XStack alignItems="center" backgroundColor="$muted" borderRadius="$5" px="$3" py="$2" onPress={handleEditSubscription}>
              <Text fontSize="$3" fontWeight="500" color="$foreground">
                Edit
              </Text>
            </XStack>
          )}
        </XStack>
        <YStack backgroundColor="$muted" borderRadius="$6" px="$4" py="$4" gap="$3">

          <XStack alignItems="center" justifyContent="space-between">
            <Text fontSize="$4" fontWeight="500" color="$foreground">
              Plan
            </Text>
            <Text fontSize="$4" color="$foreground">
              {planType || "Swap Pass"}
            </Text>
          </XStack>

          <XStack alignItems="center" justifyContent="space-between">
            <Text fontSize="$4" fontWeight="500" color="$foreground">
              Next Billing
            </Text>
            <Text fontSize="$4" color="$foreground">
              {swapAccessUntil?.toLocaleDateString() || "N/A"}
            </Text>
          </XStack>

          {/* Subscription Management Actions */}
          {showEditSubscription && !isRevenueCat && (
            <XStack gap="$3" mt="$2">
              <ButtonUI
                variant="primary"
                onPress={handleUpgradeSubscription}
                flex={1}
                size="sm"
              >
                Change Plan
              </ButtonUI>

              <ButtonUI
                variant="destructive"
                onPress={handleCancelSubscription}
                disabled={cancelSubscriptionMutation.isPending}
                flex={1}
                size="sm"
              >
                {cancelSubscriptionMutation.isPending ? "Cancelling..." : "Cancel"}
              </ButtonUI>
            </XStack>
          )}

          {/* RevenueCat Management */}
          {isRevenueCat && (
            <XStack mt="$2">
              <ButtonUI
                variant="primary"
                onPress={handleManageRevenueCatSubscription}
                flex={1}
                size="sm"
              >
                Manage Subscription
              </ButtonUI>
            </XStack>
          )}
        </YStack>
      </YStack>
    );
  }

  // Inactive subscription but still has swap access (won't renew)
  if (!isActive && isSwapActive && swapAccessUntil) {
    return (
      <YStack gap="$3">
        <Text fontSize="$5" fontWeight="500" color="$foreground">
          Subscription Cancelled
        </Text>
        <YStack backgroundColor="$muted" borderRadius="$6" px="$4" py="$4" gap="$3">
          {planType && (
            <XStack alignItems="center" justifyContent="space-between">
              <Text fontSize="$4" fontWeight="500" color="$foreground">
                Current Plan
              </Text>
              <Text fontSize="$4" color="$foreground">
                {planType}
              </Text>
            </XStack>
          )}

          <XStack alignItems="center" justifyContent="space-between">
            <Text fontSize="$4" fontWeight="500" color="$foreground">
              Access until
            </Text>
            <Text fontSize="$4" color="$foreground">
              {swapAccessUntil?.toLocaleDateString() || "N/A"}
            </Text>
          </XStack>

          <Text fontSize="$3" color="$mutedForeground">
            Your subscription is cancelled but you retain access until your current billing period ends. You cannot create a new subscription until this access expires.
          </Text>

          {/* RevenueCat Management for cancelled subscription */}
          {isRevenueCat && (
            <XStack mt="$2">
              <ButtonUI
                variant="primary"
                onPress={handleManageRevenueCatSubscription}
                flex={1}
                size="sm"
              >
                Manage Subscription
              </ButtonUI>
            </XStack>
          )}
        </YStack>
      </YStack>
    );
  }

  // No subscription and no access
  return (
    <YStack gap="$3">
      <Text fontSize="$5" fontWeight="500" color="$foreground">
        No Active Subscription
      </Text>
      <YStack backgroundColor="$muted" borderRadius="$6" px="$4" py="$4" gap="$3">
        <YStack gap="$2">
          <Text fontSize="$6" fontWeight="500" color="$foreground">
            Subscribe to Swap Pass
          </Text>
          <Text fontSize="$4" color="$mutedForeground">
            Gain access to swap listings and get boost credits for your
            listings.
          </Text>
        </YStack>

        <ButtonUI
          variant="primary"
          onPress={handleUpgradeWithCheck}
        >
          Choose Plan
        </ButtonUI>
      </YStack>
    </YStack>
  );
}