import { ThemedIonicons } from '@/components/ui/themed-icons';
import { useOnboardConnectAccount } from '@/hooks/queries/use-payments';
import { memo, useCallback, useState } from 'react';
import { Linking } from 'react-native';
import { Button, Spinner, Text, XStack, YStack } from 'tamagui';

interface StripeConnectOnboardingProps {
  /** Called after successful onboarding */
  onSuccess?: () => void;
  /** Called if onboarding fails */
  onError?: (error: Error) => void;
  /** Custom styling for the button */
  variant?: 'primary' | 'secondary';
  /** Button size */
  size?: 'small' | 'medium' | 'large';
}

/**
 * Initiates Stripe Connect hosted onboarding flow for sellers
 * Opens Stripe's hosted onboarding in system browser
 */
export const StripeConnectOnboarding = memo<StripeConnectOnboardingProps>(({
  onSuccess,
  onError,
  variant = 'primary',
  size = 'medium'
}) => {
  const [error, setError] = useState<string | null>(null);
  
  const onboardMutation = useOnboardConnectAccount();

  const handleStartOnboarding = useCallback(async () => {
    try {
      setError(null);
      
      // Define return URLs for success and refresh scenarios
      // These should be deep links that route back to your app
      const returnUrl = 'com.bidscents.mobile://seller/onboarding/complete';
      const refreshUrl = 'com.bidscents.mobile://seller/onboarding/refresh';

      // Call the backend to create Connect account and get onboarding URL
      const onboardingUrl = await onboardMutation.mutateAsync({
        returnUrl,
        refreshUrl
      });

      // Open Stripe's hosted onboarding in system browser
      const supported = await Linking.canOpenURL(onboardingUrl);
      
      if (!supported) {
        throw new Error('Cannot open onboarding URL');
      }

      await Linking.openURL(onboardingUrl);
      
      // Note: Success handling will happen via deep linking when user returns
      // The app will receive the returnUrl deep link when onboarding is complete

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start onboarding';
      setError(errorMessage);
      onError?.(error instanceof Error ? error : new Error(errorMessage));
    }
  }, [onboardMutation, onError]);

  const isLoading = onboardMutation.isPending;

  return (
    <YStack gap="$3" width="100%" maxWidth={400}>
      {error && (
        <XStack 
          alignItems="center" 
          gap="$2" 
          padding="$3" 
          backgroundColor="$background" 
          borderRadius="$4"
          borderWidth={1}
          borderColor="$error"
        >
          <ThemedIonicons name="alert-circle-outline" size={16} themeColor="error" />
          <Text fontSize="$3" color="$error" flex={1}>{error}</Text>
        </XStack>
      )}
      
      <Button
        size={size}
        onPress={handleStartOnboarding}
        disabled={isLoading}
        width="100%"
        backgroundColor={variant === 'primary' ? '$primary' : '$muted'}
        color={variant === 'primary' ? '$primaryForeground' : '$foreground'}
        pressStyle={{ 
          backgroundColor: variant === 'primary' ? '$primary' : '$muted',
          opacity: 0.8
        }}
      >
        <XStack alignItems="center" gap="$2">
          {isLoading && <Spinner size="small" color={variant === 'primary' ? '$primaryForeground' : '$foreground'} />}
          <Text color={variant === 'primary' ? '$primaryForeground' : '$foreground'}>
            {isLoading ? 'Setting up...' : 'Start Seller Onboarding'}
          </Text>
          {!isLoading && <ThemedIonicons name="open-outline" size={16} color={variant === 'primary' ? '$primaryForeground' : '$foreground'} />}
        </XStack>
      </Button>
      
      <Text fontSize="$2" color="$mutedForeground" textAlign="center">
        You&apos;ll be redirected to Stripe to verify your identity and set up payments
      </Text>
    </YStack>
  );
});

StripeConnectOnboarding.displayName = 'StripeConnectOnboarding';