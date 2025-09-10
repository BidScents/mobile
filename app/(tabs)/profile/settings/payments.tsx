import {
  PaymentMethodSection,
  PaymentsLoadingState,
  SubscriptionBenefitsSection,
  SubscriptionStatusSection,
} from "@/components/payments/settings";
import { Container } from "@/components/ui/container";
import { useAuthStore } from "@bid-scents/shared-sdk";
import { useMemo } from "react";
import { ScrollView, YStack } from "tamagui";

export default function PaymentsSettingsScreen() {
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
    const isSwapActive = Boolean(swapAccessDate && swapAccessDate > new Date());
    const isActive = paymentDetails.subscription_is_active || false;

    // Calculate total boost credits
    const boostCredits = paymentDetails.boost_credits || {};
    const totalBoostCredits = Object.values(boostCredits).reduce(
      (sum: number, credits: number) => sum + credits,
      0
    );

    // Determine plan type based on swap access duration
    let planType = null;
    if (paymentDetails.subscription_id && swapAccessDate) {
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
      isActive,
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

  // Show loading state while fetching auth data
  if (loading) {
    return <PaymentsLoadingState />;
  }

  return (
    <Container variant="padded" safeArea={false}>
      <ScrollView flex={1}>
        <YStack gap="$6" pt="$2">
          {subscriptionStatus.hasPaymentMethod && (
            <PaymentMethodSection
              hasPaymentMethod={subscriptionStatus.hasPaymentMethod}
              isSubscriptionActive={subscriptionStatus.isActive}
            />
          )}

          <SubscriptionStatusSection
            isActive={subscriptionStatus.isActive}
            isSwapActive={subscriptionStatus.isSwapActive}
            planType={subscriptionStatus.planType}
            swapAccessUntil={subscriptionStatus.swapAccessUntil}
          />

          {subscriptionStatus.isSwapActive && (
            <SubscriptionBenefitsSection
              boostCredits={subscriptionStatus.boostCredits}
            />
          )}
        </YStack>
      </ScrollView>
    </Container>
  );
}
