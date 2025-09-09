import { Button as ButtonUI } from "@/components/ui/button";
import type { SubscriptionPlan } from "@/types/products";
import { Alert, Linking } from "react-native";
import { Text, YStack } from "tamagui";

interface SubscriptionBottomActionProps {
  selectedPlan: SubscriptionPlan | null;
  isLoading: boolean;
  hasPaymentMethod: boolean;
  onContinue: () => void;
}

const handleTermsPress = async () => {
  try {
    const termsUrl =
      process.env.EXPO_PUBLIC_TERMS_URL ||
      "https://bidscents.com/terms-of-service";
    const canOpen = await Linking.canOpenURL(termsUrl);

    if (canOpen) {
      await Linking.openURL(termsUrl);
    } else {
      Alert.alert("Error", "Unable to open Terms of Service");
    }
  } catch (error) {
    console.log("Failed to open Terms of Service:", error);
    Alert.alert("Error", "Unable to open Terms of Service");
  }
};

export function SubscriptionBottomAction({
  selectedPlan,
  isLoading,
  hasPaymentMethod,
  onContinue,
}: SubscriptionBottomActionProps) {
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
      <Text
        textAlign="center"
        color="$mutedForeground"
        fontSize="$4"
        onPress={handleTermsPress}
        cursor="pointer"
        hitSlop={10}
        marginTop="$4"
        textDecorationLine="underline"
      >
        Terms of Service
      </Text>

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
    </YStack>
  );
}
