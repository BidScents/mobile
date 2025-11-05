import {
  SubscriptionBottomAction,
  SubscriptionHeader,
  SubscriptionLoadingState,
  SubscriptionPlanCard,
} from "@/components/payments/paywall";
import { Button as ButtonUI } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { useRevenueCatCustomerInfo, useRevenueCatOfferings, useRevenueCatPurchase, useRevenueCatRestore } from "@/hooks/queries/use-revenuecat-purchases";
import { requireAuth } from "@/utils/auth-helper";
import { useAuthStore } from "@bid-scents/shared-sdk";
import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Alert } from "react-native";
import { Text, YStack } from "tamagui";

export default function SubscriptionPaywallScreen() {
  const { paymentDetails } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const offeringsQuery = useRevenueCatOfferings();
  const purchaseMutation = useRevenueCatPurchase();
  const customerInfoQuery = useRevenueCatCustomerInfo();
  const restoreMutation = useRevenueCatRestore();

  // Check if user has redeemed free trial
  const hasRedeemedFreeTrial = paymentDetails?.redeemed_free_trial || false;

  // Check if user is eligible to create a new subscription
  const isEligibleForNewSubscription = useMemo(() => {
    if (!paymentDetails) return true;

    // Backend eligibility check
    const isSubscriptionActive = paymentDetails.subscription_is_active || false;
    const swapAccessDate = paymentDetails.eligible_for_swap_until
      ? new Date(paymentDetails.eligible_for_swap_until)
      : null;
    const hasSwapAccess = Boolean(swapAccessDate && swapAccessDate > new Date());

    const backendEligible = !hasSwapAccess || (hasSwapAccess && isSubscriptionActive);

    // RevenueCat eligibility check - no active subscriptions
    const customerInfo = customerInfoQuery.data;
    const hasActiveRevenueCatSubscriptions = (customerInfo?.activeSubscriptions?.length ?? 0) > 0;

    // User can create subscription if:
    // 1. Backend eligibility passes AND
    // 2. No active RevenueCat subscriptions
    return backendEligible && !hasActiveRevenueCatSubscriptions;
  }, [paymentDetails, customerInfoQuery.data]);

  // Get subscription plans from RevenueCat offerings
  const subscriptionPlans = offeringsQuery.data || [];

  // Default to monthly plan
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const selectedPlanData = subscriptionPlans.find(plan => plan.id === selectedPlan);

  // Set default selected plan when plans are loaded
  useMemo(() => {
    if (subscriptionPlans.length > 0 && !selectedPlan) {
      const monthlyPlan = subscriptionPlans.find(plan => plan.type === 'monthly_swap');
      if (monthlyPlan) {
        setSelectedPlan(monthlyPlan.id);
      }
    }
  }, [subscriptionPlans, selectedPlan]);


  const handleContinue = useCallback(async () => {
    if (!requireAuth()) {
      return
    }
    // Check eligibility first
    if (!isEligibleForNewSubscription) {
      const customerInfo = customerInfoQuery.data;
      const hasActiveRevenueCatSubscriptions = (customerInfo?.activeSubscriptions?.length ?? 0) > 0;
      
      if (hasActiveRevenueCatSubscriptions) {
        Alert.alert(
          "Active Subscription Found",
          "You already have an active subscription. Please cancel your current subscription before creating a new one.",
          [{ text: "OK", style: "default" }]
        );
      } else {
        const swapAccessDate = paymentDetails?.eligible_for_swap_until
          ? new Date(paymentDetails.eligible_for_swap_until)
          : null;
        
        Alert.alert(
          "Cannot Create Subscription",
          `You still have active swap access until ${swapAccessDate?.toLocaleDateString()}. You cannot create a new subscription until your current access expires.`,
          [{ text: "OK", style: "default" }]
        );
      }
      return;
    }

    if (!selectedPlan) {
      Alert.alert(
        "Select a Plan",
        "Please choose a subscription plan to continue"
      );
      return;
    }

    // Find the selected plan to get the RevenueCat package
    const selectedPlanData = subscriptionPlans.find(plan => plan.id === selectedPlan);
    if (!selectedPlanData) {
      Alert.alert("Error", "Selected plan not found");
      return;
    }

    setIsLoading(true);

    // Purchase the package through RevenueCat
    purchaseMutation.mutate(selectedPlanData.package, {
      onSuccess: () => {
        setIsLoading(false);
        // Navigate to payments settings page
        router.replace("/(tabs)/profile/settings/payments");
      },
      onError: () => {
        setIsLoading(false);
      }
    });
  }, [selectedPlan, subscriptionPlans, paymentDetails, purchaseMutation, isEligibleForNewSubscription, customerInfoQuery.data]);

  const handleRestorePurchases = useCallback(() => {
    if (!requireAuth()) {
      return
    }
    restoreMutation.mutate();
  }, [restoreMutation]);

  // Show loading state while fetching offerings or customer info
  if (offeringsQuery.isLoading || customerInfoQuery.isLoading) {
    return <SubscriptionLoadingState type="loading" />;
  }

  // Show error state if offerings failed to load
  if (offeringsQuery.isError || subscriptionPlans.length === 0) {
    return <SubscriptionLoadingState type="error" />;
  }

  // Show error state if user is not eligible for new subscription
  if (!isEligibleForNewSubscription) {
    return (
      <Container variant="padded" safeArea={false}>
        <YStack flex={1} justifyContent="center" alignItems="center" gap="$4" px="$4">
          <Text fontSize="$6" fontWeight="600" color="$foreground" textAlign="center">
            Cannot Create Subscription
          </Text>
          <Text fontSize="$4" color="$mutedForeground" textAlign="center">
            {(customerInfoQuery.data?.activeSubscriptions?.length ?? 0) > 0 
              ? "You already have an active subscription. Please cancel your current subscription before creating a new one."
              : "You still have active swap access from your previous subscription. You cannot create a new subscription until your current access expires."
            }
          </Text>
          <ButtonUI
            variant="outline"
            onPress={() => router.back()}
          >
            Go Back
          </ButtonUI>
        </YStack>
      </Container>
    );
  }

  return (
    <Container variant="padded" safeArea={false}>
      <YStack flex={1} paddingTop="$2" gap="$6">
        <SubscriptionHeader />

        {/* Subscription Plans */}
        <YStack flex={1} gap="$4">
          {subscriptionPlans.map((plan) => (
            <SubscriptionPlanCard
              key={plan.id}
              plan={plan}
              isSelected={selectedPlan === plan.id}
              onSelect={() => setSelectedPlan(plan.id)}
              hideFreeTrial={hasRedeemedFreeTrial}
            />
          ))}
        </YStack>
      </YStack>

      <SubscriptionBottomAction
        selectedPlan={selectedPlanData || null}
        isLoading={isLoading}
        hasPaymentMethod={true} // RevenueCat handles payment natively
        onContinue={handleContinue}
        onRestore={handleRestorePurchases}
        isRestoring={restoreMutation.isPending}
      />
    </Container>
  );
}
