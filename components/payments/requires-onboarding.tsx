import { useOnboardConnectAccount } from "@/hooks/queries/use-payments";
import { AuthService } from "@/utils/auth-service";
import { useAuthStore } from "@bid-scents/shared-sdk";
import { useState } from "react";
import { Linking } from "react-native";
import { Text, XStack, YStack } from "tamagui";
import { ThemedIonicons } from "../ui/themed-icons";

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
      subscription_is_active: paymentDetails?.subscription_is_active || false
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
      <YStack paddingHorizontal="$4" paddingVertical="$2">
        <XStack alignItems="center" justifyContent="space-between" backgroundColor="$muted" borderRadius="$6" paddingHorizontal="$4" paddingVertical="$2">
          <YStack padding="$2" gap="$1.5">
            <Text color="$foreground" fontSize="$6" fontWeight="500">Complete onboarding</Text>
            <Text color="$mutedForeground" fontSize="$4" fontWeight="400">To start earning from your listings</Text>
          </YStack>
          <ThemedIonicons name="chevron-forward" size={20} color="$foreground" />
        </XStack>
      </YStack>
    );
  }

  return null;
}
