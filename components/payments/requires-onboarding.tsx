import { Button } from "@/components/ui/button";
import { useOnboardConnectAccount } from "@/hooks/queries/use-payments";
import { AuthService } from "@/utils/auth-service";
import { useAuthStore } from "@bid-scents/shared-sdk";
import { useState } from "react";
import { Linking } from "react-native";
import { YStack } from "tamagui";

export default function RequiresOnboarding() {
  const { paymentDetails, setPaymentDetails } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const onboardMutation = useOnboardConnectAccount();

  const updatePaymentDetails = () => {
    setPaymentDetails({
      has_connect_account: true,
      requires_onboarding: true,
      has_payment_method: paymentDetails?.has_payment_method || false,
      eligible_for_swap_until: paymentDetails?.eligible_for_swap_until || null,
      subscription_id: paymentDetails?.subscription_id || null,
      boost_credits: paymentDetails?.boost_credits || {},
      redeemed_free_trial: paymentDetails?.redeemed_free_trial || false,
    });
  };

  const handleBannerPress = async () => {
    try {
      setIsLoading(true);

      const apiBaseUrl =
        process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:8000";
      const returnUrl = `${apiBaseUrl}/api/v1/link/onboarding-complete?source=mobile`;
      const refreshUrl = `${apiBaseUrl}/api/v1/link/onboarding-refresh?source=mobile`;

      const onboardingUrl = await onboardMutation.mutateAsync({
        returnUrl,
        refreshUrl,
      });

      updatePaymentDetails();

      const supported = await Linking.canOpenURL(onboardingUrl);
      if (!supported) {
        throw new Error("Cannot open onboarding URL");
      }

      await Linking.openURL(onboardingUrl);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to start onboarding";
      console.error(errorMessage);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        AuthService.refreshCurrentUser();
      }, 10000);
    }
  };

  const getButtonMessage = () => {
    if (!paymentDetails?.has_connect_account) {
      return "Setup payments";
    }
    if (paymentDetails?.requires_onboarding) {
      return "Complete onboarding";
    }
    return "Setup payments";
  };

  if (
    paymentDetails?.requires_onboarding ||
    !paymentDetails?.has_connect_account
  ) {
    return (
      <YStack padding="$2" gap="$2">
        <Button
          variant="secondary"
          size="md"
          fullWidth
          onPress={handleBannerPress}
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : getButtonMessage()}
        </Button>
      </YStack>
    );
  }

  return null;
}
