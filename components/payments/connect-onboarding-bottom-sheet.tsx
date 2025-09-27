import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { ThemedIonicons } from "@/components/ui/themed-icons";
import { useOnboardConnectAccount } from "@/hooks/queries/use-payments";
import { useAuthStore } from "@bid-scents/shared-sdk";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import React, { forwardRef, useImperativeHandle, useState } from "react";
import { Linking } from "react-native";
import { Text, XStack, YStack } from "tamagui";

export interface ConnectOnboardingBottomSheetMethods {
  present: () => void;
  dismiss: () => void;
}

export interface ConnectOnboardingBottomSheetProps {
  /** Callback when onboarding is completed */
  onComplete?: () => void;
  /** Callback when user chooses to do it later */
  onDoLater?: () => void;
}

export const ConnectOnboardingBottomSheet = forwardRef<
  ConnectOnboardingBottomSheetMethods,
  ConnectOnboardingBottomSheetProps
>(({ onComplete, onDoLater }, ref) => {
  const [preloadedUrl, setPreloadedUrl] = useState<string | null>(null);
  const bottomSheetRef = React.useRef<BottomSheetModalMethods>(null);
  const { paymentDetails, setPaymentDetails } = useAuthStore();
  const onboardMutation = useOnboardConnectAccount();

  useImperativeHandle(ref, () => ({
    present: async () => {
      setPreloadedUrl(null);
      bottomSheetRef.current?.present();
      
      // Start preloading the onboarding URL
      try {
        const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8000';
        const returnUrl = `${apiBaseUrl}/api/v1/link/onboarding-complete?source=mobile`;
        const refreshUrl = `${apiBaseUrl}/api/v1/link/onboarding-refresh?source=mobile`;

        const onboardingUrl = await onboardMutation.mutateAsync({
          returnUrl,
          refreshUrl
        });
        
        setPreloadedUrl(onboardingUrl);
      } catch (error) {
        // TanStack Query will handle error state automatically
        console.error('Failed to preload onboarding URL:', error);
      }
    },
    dismiss: () => bottomSheetRef.current?.dismiss(),
  }));

  const updatePaymentDetails = () => {
    setPaymentDetails({
      has_connect_account: true,
      has_payment_method: paymentDetails?.has_payment_method || false,
      requires_onboarding: paymentDetails?.requires_onboarding || true,
      eligible_for_swap_until: paymentDetails?.eligible_for_swap_until || null,
      subscription_id: paymentDetails?.subscription_id || null,
      boost_credits: paymentDetails?.boost_credits || {},
      redeemed_free_trial: paymentDetails?.redeemed_free_trial || false,
      subscription_is_active: paymentDetails?.subscription_is_active || false
    });
  };

  const handleContinue = async () => {
    try {
      // Use preloaded URL if available, otherwise fall back to making the call
      let onboardingUrl = preloadedUrl;
      
      if (!onboardingUrl) {
        const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8000';
        const returnUrl = `${apiBaseUrl}/api/v1/link/onboarding-complete?source=mobile`;
        const refreshUrl = `${apiBaseUrl}/api/v1/link/onboarding-refresh?source=mobile`;

        onboardingUrl = await onboardMutation.mutateAsync({
          returnUrl,
          refreshUrl
        });
      }

      updatePaymentDetails();

      const supported = await Linking.canOpenURL(onboardingUrl);
      if (!supported) {
        throw new Error('Cannot open onboarding URL');
      }

      await Linking.openURL(onboardingUrl);
      
      bottomSheetRef.current?.dismiss();
      onComplete?.();

    } catch (error) {
      // TanStack Query will handle error state automatically
      console.error('Failed to start onboarding:', error);
    }
  };

  const handleDoLater = async () => {
    try {
      // Use preloaded URL if available, otherwise make the call
      if (!preloadedUrl) {
        const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8000';
        const returnUrl = `${apiBaseUrl}/api/v1/link/onboarding-complete?source=mobile`;
        const refreshUrl = `${apiBaseUrl}/api/v1/link/onboarding-refresh?source=mobile`;

        await onboardMutation.mutateAsync({
          returnUrl,
          refreshUrl
        });
      }

      updatePaymentDetails();
      
      bottomSheetRef.current?.dismiss();
      onDoLater?.();

    } catch (error) {
      // TanStack Query will handle error state automatically
      console.error('Failed to set up payment account:', error);
    }
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      enableDynamicSizing={true}
      onDismiss={() => {
        setPreloadedUrl(null);
      }}
      enablePanDownToClose={!onboardMutation.isPending}
      pressBehavior={onboardMutation.isPending ? "none" : "close"}
    >
      <YStack gap="$5" padding="$4" paddingBottom="$8">
        {/* Header */}
        <YStack gap="$2">
          <Text
            fontSize="$7"
            fontWeight="600"
            color="$foreground"
          >
            Payment Setup Required
          </Text>
          <Text
            color="$mutedForeground"
            fontSize="$4"
            lineHeight="$5"
          >
            Setup your profile to receive payments
          </Text>
        </YStack>

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
            <ThemedIonicons name="alert-circle-outline" size={20} themeColor="error" />
            <Text fontSize="$3" color="$error" flex={1}>{onboardMutation.error?.message}</Text>
          </XStack>
        )}

        {/* Preloading Indicator */}
        {onboardMutation.isPending && (
          <XStack 
            alignItems="center" 
            gap="$3" 
            padding="$3" 
            backgroundColor="$background" 
            borderRadius="$4"
            borderWidth={1}
            borderColor="$blue6"
          >
            <ThemedIonicons name="refresh-outline" size={20} color="$blue11" />
            <Text fontSize="$3" color="$blue11" flex={1}>Preparing payment setup...</Text>
          </XStack>
        )}

        {/* Buttons */}
        <XStack gap="$3">
          <Button
            variant="secondary"
            size="lg"
            flex={1}
            onPress={handleDoLater}
            disabled={onboardMutation.isPending}
          >
            Do It Later
          </Button>
          
          <Button
            variant="primary"
            size="lg"
            flex={1}
            onPress={handleContinue}
            disabled={onboardMutation.isPending}
          >
            Continue
          </Button>
        </XStack>
      </YStack>
    </BottomSheet>
  );
});

ConnectOnboardingBottomSheet.displayName = "ConnectOnboardingBottomSheet";