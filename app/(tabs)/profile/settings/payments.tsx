import {
  PaymentMethodSection,
  PaymentsLoadingState,
  SubscriptionBenefitsSection,
  SubscriptionStatusSection,
} from "@/components/payments/settings";
import { Container } from "@/components/ui/container";
import { useRevenueCatCustomerInfo, useRevenueCatRestore } from "@/hooks/queries/use-revenuecat-purchases";
import { useAuthStore } from "@bid-scents/shared-sdk";
import { useMemo } from "react";
import { ScrollView, Text, XStack, YStack } from "tamagui";

export default function PaymentsSettingsScreen() {
  const { paymentDetails, loading } = useAuthStore();
  const { data: revenueCatCustomerInfo, isLoading: revenueCatLoading } = useRevenueCatCustomerInfo();
  const restoreMutation = useRevenueCatRestore();

  // Compute subscription status from payment details and RevenueCat data
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
        isRevenueCat: false,
        managementURL: null,
      };
    }

    // Detect if subscription is RevenueCat (subscription_id doesn't start with 'sub_')
    const subscriptionId = paymentDetails.subscription_id;
    const isRevenueCat = Boolean(subscriptionId && !subscriptionId.startsWith('sub_'));

    const swapAccessDate = paymentDetails.eligible_for_swap_until
      ? new Date(paymentDetails.eligible_for_swap_until)
      : null;
    const isSwapActive = Boolean(swapAccessDate && swapAccessDate > new Date());
    
    // Use RevenueCat data for subscription status if it's a RevenueCat subscription
    let isActive = paymentDetails.subscription_is_active || false;
    let managementURL = null;
    
    if (isRevenueCat && revenueCatCustomerInfo) {
      // Check if user has any active subscriptions in RevenueCat
      isActive = revenueCatCustomerInfo.activeSubscriptions.length > 0;
      
      // For managementURL, use RevenueCat's URL if available, otherwise we'll fallback in the component
      // RevenueCat only provides managementURL for active subscriptions, but we want to show manage button
      // for cancelled subscriptions too (they can still be managed via App Store)
      managementURL = revenueCatCustomerInfo.managementURL;
      
      // Check if there are any subscription transactions (active or cancelled)
      const hasAnySubscriptions = Object.keys(revenueCatCustomerInfo.subscriptionsByProductIdentifier).length > 0;
      
      // If there are subscriptions but no managementURL, we'll use App Store fallback
      if (hasAnySubscriptions && !managementURL) {
        // On iOS, we can always manage subscriptions through App Store
        managementURL = 'https://apps.apple.com/account/subscriptions';
      }
    }

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
      isRevenueCat,
      managementURL,
    };
  }, [paymentDetails, revenueCatCustomerInfo]);

  // Show loading state while fetching auth data or RevenueCat data
  if (loading || revenueCatLoading) {
    return <PaymentsLoadingState />;
  }

  return (
    <Container variant="padded" safeArea={false}>
      <ScrollView flex={1}>
        <YStack gap="$6" pt="$2">
          {subscriptionStatus.hasPaymentMethod && !subscriptionStatus.isRevenueCat && (
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
            isRevenueCat={subscriptionStatus.isRevenueCat}
            managementURL={subscriptionStatus.managementURL}
          />

          {subscriptionStatus.isSwapActive && (
            <SubscriptionBenefitsSection
              boostCredits={subscriptionStatus.boostCredits}
            />
          )}
        </YStack>

        {/* Restore Purchases Text at Bottom */}
        {subscriptionStatus.isRevenueCat && (
          <XStack justifyContent="center" paddingBottom="$4" paddingTop="$2">
            <Text
              fontSize="$4"
              color="$foreground"
              textDecorationLine="underline"
              onPress={() => restoreMutation.mutate()}
              cursor="pointer"
              hitSlop={15}
              opacity={restoreMutation.isPending ? 0.5 : 1}
              textAlign="center"
            >
              {restoreMutation.isPending ? 'Restoring Purchases...' : 'Restore Purchases'}
            </Text>
          </XStack>
        )}
      </ScrollView>
    </Container>
  );
}
