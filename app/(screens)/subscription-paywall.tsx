import { StripeSetupPaymentMethod } from "@/components/payments/stripe-setup-payment-method";
import { SubscriptionBottomAction } from "@/components/payments/subscription-bottom-action";
import { SubscriptionHeader } from "@/components/payments/subscription-header";
import { SubscriptionLoadingState } from "@/components/payments/subscription-loading-state";
import { SubscriptionPlanCard } from "@/components/payments/subscription-plan-card";
import { Container } from "@/components/ui/container";
import { useCreateSubscription, useListProducts } from "@/hooks/queries/use-payments";
import { AuthService } from "@/utils/auth-service";
import { mapPlanTypeToPassType, transformProductsToPlans } from "@/utils/pricing";
import { SubscriptionRequest, useAuthStore, useLoadingStore } from "@bid-scents/shared-sdk";
import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Alert } from "react-native";
import { YStack } from "tamagui";


export default function SubscriptionPaywallScreen() {
  const { paymentDetails } = useAuthStore();
  const { showLoading, hideLoading } = useLoadingStore();
  const [showPaymentSetup, setShowPaymentSetup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const createSubscriptionMutation = useCreateSubscription();
  const productsQuery = useListProducts();

  // Check if user has redeemed free trial
  const hasRedeemedFreeTrial = paymentDetails?.redeemed_free_trial || false;

  // Transform products data to subscription plans
  const subscriptionPlans = useMemo(() => {
    if (!productsQuery.data) return [];
    return transformProductsToPlans(productsQuery.data);
  }, [productsQuery.data]);

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
    if (!selectedPlan) {
      Alert.alert(
        "Select a Plan",
        "Please choose a subscription plan to continue"
      );
      return;
    }

    // Find the selected plan to get the PassType
    const selectedPlanData = subscriptionPlans.find(plan => plan.id === selectedPlan);
    if (!selectedPlanData) {
      Alert.alert("Error", "Selected plan not found");
      return;
    }

    const passType = mapPlanTypeToPassType(selectedPlanData.type);

    // If user already has a payment method, show confirmation alert
    if (paymentDetails?.has_payment_method) {
      Alert.alert(
        "Confirm Subscription",
        "Use your saved payment method to subscribe?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Subscribe",
            style: "default",
            onPress: async () => {
              setIsLoading(true);
              showLoading();

              try {
                const subscriptionRequest: SubscriptionRequest = {
                  subscription_type: passType,
                  // No payment_method_id needed since customer already has one
                };

                await createSubscriptionMutation.mutateAsync(
                  subscriptionRequest
                );

                // Refresh user data to get updated payment details
                await AuthService.refreshCurrentUser();

                hideLoading();
                // Navigate to payments settings page
                router.push("/(tabs)/profile/settings/payments");
              } catch (error: any) {
                hideLoading();
                Alert.alert(
                  "Subscription Failed",
                  `Failed to create subscription: ${error?.message || 'Unknown error'}\n\nPlease try again or contact support.`
                );
              } finally {
                setIsLoading(false);
              }
            },
          },
        ]
      );
    } else {
      // Show payment setup for new users (will auto-open Stripe sheet)
      setShowPaymentSetup(true);
    }
  }, [selectedPlan, subscriptionPlans, paymentDetails, createSubscriptionMutation]);

  const handlePaymentSetupSuccess = useCallback(async (paymentMethodId: string) => {
    if (!selectedPlan) return;

    // Find the selected plan to get the PassType
    const selectedPlanData = subscriptionPlans.find(plan => plan.id === selectedPlan);
    if (!selectedPlanData) return;

    const passType = mapPlanTypeToPassType(selectedPlanData.type);

    setShowPaymentSetup(false);
    setIsLoading(true);
    showLoading();
    
    try {
      const subscriptionRequest: SubscriptionRequest = {
        subscription_type: passType,
        payment_method_id: paymentMethodId, // Include the payment method ID from setup
      };

      await createSubscriptionMutation.mutateAsync(subscriptionRequest);

      // Refresh user data to get updated payment details
      await AuthService.refreshCurrentUser();

      hideLoading();
      // Navigate to payments settings page
      router.push("/(tabs)/profile/settings/payments");
    } catch (error: any) {
      hideLoading();
      Alert.alert(
        "Subscription Failed",
        `Failed to create subscription: ${error?.message || 'Unknown error'}\n\nPlease try again or contact support.`
      );
    } finally {
      setIsLoading(false);
    }
  }, [selectedPlan, subscriptionPlans, createSubscriptionMutation]);

  const handlePaymentSetupError = useCallback((error: Error) => {
    setShowPaymentSetup(false);
    setIsLoading(false);

    // Don't show alert for user cancellation
    if (error.message !== "USER_CANCELLED") {
      Alert.alert("Payment Setup Failed", error.message);
    }
  }, []);

  // Show loading state while fetching products
  if (productsQuery.isLoading) {
    return <SubscriptionLoadingState type="loading" />;
  }

  // Show error state if products failed to load
  if (productsQuery.isError || subscriptionPlans.length === 0) {
    return <SubscriptionLoadingState type="error" />;
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
        hasPaymentMethod={paymentDetails?.has_payment_method || false}
        onContinue={handleContinue}
      />

      {/* Payment Setup - Auto-presents when showPaymentSetup is true */}
      {showPaymentSetup && (
        <StripeSetupPaymentMethod
          onSuccess={handlePaymentSetupSuccess}
          onError={handlePaymentSetupError}
        />
      )}
    </Container>
  );
}
