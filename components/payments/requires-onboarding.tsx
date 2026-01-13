import { useOnboardConnectAccount } from "@/hooks/queries/use-payments";
import { AuthService } from "@/utils/auth-service";
import { useAuthStore } from "@bid-scents/shared-sdk";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { useRef, useState } from "react";
import { Linking } from "react-native";
import { Text, XStack, YStack } from "tamagui";
import { BottomSheet } from "../ui/bottom-sheet";
import { ThemedIonicons } from "../ui/themed-icons";
import { OnboardingGuideCarousel } from "./onboarding-guide-carousel";

export default function RequiresOnboarding() {
  const { paymentDetails, setPaymentDetails } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const onboardMutation = useOnboardConnectAccount();
  const bottomSheetRef = useRef<BottomSheetModalMethods>(null);

  const updatePaymentDetails = () => {
    setPaymentDetails({
      has_connect_account: true,
      requires_onboarding: true,
      has_payment_method: paymentDetails?.has_payment_method || false,
      eligible_for_swap_until: paymentDetails?.eligible_for_swap_until || null,
      subscription_id: paymentDetails?.subscription_id || null,
      boost_credits: paymentDetails?.boost_credits || {},
      redeemed_free_trial: paymentDetails?.redeemed_free_trial || false,
      subscription_is_active: paymentDetails?.subscription_is_active || false,
    });
  };

  const executeOnboarding = async () => {
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
      bottomSheetRef.current?.dismiss();
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

  const handleBannerPress = () => {
    bottomSheetRef.current?.present();
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
      <>
        <YStack paddingHorizontal="$4" paddingVertical="$2">
          <XStack
            onPress={isLoading ? undefined : handleBannerPress}
            pressStyle={{ opacity: 0.8, transform: [{ scale: 0.98 }] }}
            alignItems="center"
            justifyContent="space-between"
            backgroundColor={isLoading ? "$red2" : "$red4"}
            borderRadius="$6"
            padding="$2"
            px="$3"
          >
            <YStack padding="$2" gap="$1.5">
              <Text
                color="$foreground"
                opacity={isLoading ? 0.5 : 1}
                fontSize="$5"
                fontWeight="600"
              >
                {getButtonMessage()}
              </Text>
              <Text
                color="$foreground"
                opacity={isLoading ? 0.5 : 1}
                fontSize="$4"
                fontWeight="400"
              >
                To start earning from your listings
              </Text>
            </YStack>
            <ThemedIonicons
              name="chevron-forward"
              size={23}
              color="$error"
            />
          </XStack>
        </YStack>

        <BottomSheet
          ref={bottomSheetRef}
          enableDynamicSizing={true}
          enablePanDownToClose={false}
          pressBehavior={"none"}
        >
          <YStack gap="$5" padding="$4" paddingBottom="$8">
            <OnboardingGuideCarousel
              onComplete={executeOnboarding}
              onSkip={() => bottomSheetRef.current?.dismiss()}
              loading={isLoading || onboardMutation.isPending}
            />

            {/* Error Display */}
            {onboardMutation.isError && (
              <XStack
                alignItems="center"
                gap="$3"
                padding="$3"
                backgroundColor="$background"
                borderRadius="$4"
                borderWidth={1}
                borderColor="$error"
              >
                <ThemedIonicons
                  name="alert-circle-outline"
                  size={20}
                  themeColor="error"
                />
                <Text fontSize="$3" color="$error" flex={1}>
                  {onboardMutation.error?.message}
                </Text>
              </XStack>
            )}
          </YStack>
        </BottomSheet>
      </>
    );
  }

  return null;
}
