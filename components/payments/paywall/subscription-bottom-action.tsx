import { LegalDocumentsBottomSheet, LegalDocumentsBottomSheetMethods } from "@/components/forms/legal-documents-bottom-sheet";
import { Button as ButtonUI } from "@/components/ui/button";
import type { SubscriptionPlan } from "@/types/products";
import React, { useRef } from "react";
import { Text, XStack, YStack } from "tamagui";

interface SubscriptionBottomActionProps {
  selectedPlan: SubscriptionPlan | null;
  isLoading: boolean;
  hasPaymentMethod: boolean;
  onContinue: () => void;
}

export function SubscriptionBottomAction({
  selectedPlan,
  isLoading,
  hasPaymentMethod,
  onContinue,
}: SubscriptionBottomActionProps) {
  const legalBottomSheetRef = useRef<LegalDocumentsBottomSheetMethods>(null);

  const handleTermsPress = () => {
    legalBottomSheetRef.current?.presentWithTab('terms');
  };

  const handlePrivacyPress = () => {
    legalBottomSheetRef.current?.presentWithTab('privacy');
  };
  const getButtonText = () => {
    if (isLoading) return "Processing...";

    const planTitle = selectedPlan?.title || "Plan";
    return hasPaymentMethod
      ? `Subscribe to ${planTitle}`
      : `Continue with ${planTitle}`;
  };

  return (
    <YStack
      position="absolute"
      bottom={0}
      left={0}
      right={0}
      backgroundColor="transparent"
      paddingHorizontal="$4"
      paddingBottom="$5"
      gap="$3"
    >
      <XStack justifyContent="center" alignItems="center" flexWrap="wrap" gap="$1" marginTop="$4">
        <Text 
          textAlign="center" 
          color="$mutedForeground" 
          fontSize="$3"
        >
          By subscribing, you agree to our{' '}
        </Text>
        <Text
          color="$foreground"
          fontSize="$3"
          textDecorationLine="underline"
          onPress={handleTermsPress}
          cursor="pointer"
          hitSlop={10}
        >
          Terms of Service
        </Text>
        <Text 
          color="$mutedForeground" 
          fontSize="$3"
        >
          {' '}and{' '}
        </Text>
        <Text
          color="$foreground"
          fontSize="$3"
          textDecorationLine="underline"
          onPress={handlePrivacyPress}
          cursor="pointer"
          hitSlop={10}
        >
          Privacy Policy
        </Text>
      </XStack>

      <ButtonUI
        variant="primary"
        haptic
        size="lg"
        fullWidth
        onPress={onContinue}
        disabled={!selectedPlan || isLoading}
        borderRadius="$10"
      >
        {getButtonText()}
      </ButtonUI>

      {/* Legal Documents Bottom Sheet */}
      <LegalDocumentsBottomSheet ref={legalBottomSheetRef} />
    </YStack>
  );
}
