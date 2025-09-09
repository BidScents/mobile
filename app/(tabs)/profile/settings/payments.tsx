import {
  PaymentMethodSection,
  PaymentsLoadingState,
  SubscriptionBenefitsSection,
  SubscriptionManagementSection,
  SubscriptionStatusSection,
} from "@/components/payments/settings";
import { Container } from "@/components/ui/container";
import { useCancelSubscription } from "@/hooks/queries/use-payments";
import { useAuthStore } from "@bid-scents/shared-sdk";
import { router } from "expo-router";
import { useCallback, useMemo } from "react";
import { Alert } from "react-native";
import { ScrollView, YStack } from "tamagui";

export default function PaymentsSettingsScreen() {
  const cancelSubscriptionMutation = useCancelSubscription();
  const { paymentDetails, loading } = useAuthStore();

  // Compute subscription status from payment details
  const subscriptionStatus = useMemo(() => {
    if (!paymentDetails) {
      return {
        isActive: false,
        hasPaymentMethod: false,
        planType: null,
        swapAccessUntil: null,
        isSwapActive: false,
        boostCredits: {},
        totalBoostCredits: 0,
      };
    }

    const swapAccessDate = paymentDetails.eligible_for_swap_until
      ? new Date(paymentDetails.eligible_for_swap_until)
      : null;
    const isSwapActive = swapAccessDate && swapAccessDate > new Date();
    const hasActiveSubscription = !!(
      paymentDetails.subscription_id && isSwapActive
    );

    // Calculate total boost credits
    const boostCredits = paymentDetails.boost_credits || {};
    const totalBoostCredits = Object.values(boostCredits).reduce(
      (sum: number, credits: number) => sum + credits,
      0
    );

    // Determine plan type based on swap access duration
    let planType = null;
    if (hasActiveSubscription && swapAccessDate) {
      const now = new Date();
      const daysDifference = Math.ceil(
        (swapAccessDate.getTime() - now.getTime()) / (1000 * 3600 * 24)
      );

      if (daysDifference <= 7) {
        planType = "Weekly Swap Pass";
      } else if (daysDifference <= 31) {
        planType = "Monthly Swap Pass";
      } else {
        planType = "Yearly Swap Pass";
      }
    }

    return {
      isActive: hasActiveSubscription,
      hasPaymentMethod: paymentDetails.has_payment_method,
      planType,
      swapAccessUntil: swapAccessDate,
      isSwapActive,
      boostCredits,
      totalBoostCredits,
      hasConnectAccount: paymentDetails.has_connect_account,
      redeemedFreeTrial: paymentDetails.redeemed_free_trial,
    };
  }, [paymentDetails]);

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

  const handleUpgradeSubscription = useCallback(() => {
    router.push("/(screens)/subscription-paywall");
  }, []);

  // Show loading state while fetching auth data
  if (loading) {
    return <PaymentsLoadingState />;
  }

  return (
    <Container variant="padded" safeArea={false}>
      <ScrollView flex={1}>
        <YStack gap="$6" pt="$2">
          <PaymentMethodSection
            hasPaymentMethod={subscriptionStatus.hasPaymentMethod}
          />

          <SubscriptionStatusSection
            isActive={subscriptionStatus.isActive}
            planType={subscriptionStatus.planType}
            swapAccessUntil={subscriptionStatus.swapAccessUntil}
            onUpgrade={handleUpgradeSubscription}
          />

          {subscriptionStatus.isActive && (
            <SubscriptionBenefitsSection
              boostCredits={subscriptionStatus.boostCredits}
            />
          )}

          {subscriptionStatus.isActive && (
            <SubscriptionManagementSection
              onUpgrade={handleUpgradeSubscription}
              onCancel={handleCancelSubscription}
              isCancelling={cancelSubscriptionMutation.isPending}
            />
          )}
        </YStack>
      </ScrollView>
    </Container>
  );
}
