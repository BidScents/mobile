import { ThemedIonicons } from '@/components/ui/themed-icons';
import { useSetupPaymentMethod } from '@/hooks/queries/use-payments';
import {
  useStripe
} from '@stripe/stripe-react-native';
import { memo, useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { Button, Spinner, Text, XStack, YStack } from 'tamagui';

interface StripeSetupPaymentMethodProps {
  /** Customer email for the setup */
  customerEmail?: string;
  /** Customer ID from your backend */
  customerId?: string;
  /** Ephemeral key secret for customer */
  ephemeralKeySecret?: string;
  /** Called when setup succeeds */
  onSuccess: () => void;
  /** Called when setup fails */
  onError: (error: Error) => void;
  /** Called when component mounts to start setup process */
  onMount?: () => void;
}

/**
 * Component for setting up payment methods (saving cards) using PaymentSheet
 * Used for subscriptions and faster future payments
 */
export const StripeSetupPaymentMethod = memo<StripeSetupPaymentMethodProps>(({
  customerEmail,
  customerId,
  ephemeralKeySecret,
  onSuccess,
  onError,
  onMount
}) => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const setupMutation = useSetupPaymentMethod();

  // Initialize setup intent when component mounts
  useEffect(() => {
    const initializeSetup = async () => {
      try {
        onMount?.();
        const secret = await setupMutation.mutateAsync();
        setClientSecret(secret);
      } catch (error) {
        onError(error instanceof Error ? error : new Error('Failed to initialize payment method setup'));
      }
    };

    initializeSetup();
  }, [setupMutation, onError, onMount]);

  const initializePaymentSheet = useCallback(async () => {
    if (!clientSecret) return;

    try {
      const { error } = await initPaymentSheet({
        merchantDisplayName: 'BidScents',
        setupIntentClientSecret: clientSecret,
        
        // Customer configuration (required for saving payment methods)
        ...(customerId && ephemeralKeySecret && {
          customerId,
          customerEphemeralKeySecret: ephemeralKeySecret,
        }),

        // Default billing details
        defaultBillingDetails: {
          email: customerEmail,
        },

        // Use system theme colors - Stripe will adapt to device theme automatically

        // This is for setup, so we want to save the payment method
        allowsDelayedPaymentMethods: true,
        returnURL: 'com.bidscents.mobile://payment-methods/return',
      });

      if (error) {
        throw new Error(error.message);
      }

      setIsReady(true);
    } catch (error) {
      onError(error instanceof Error ? error : new Error('Failed to initialize payment setup'));
    }
  }, [
    initPaymentSheet,
    clientSecret,
    customerId,
    ephemeralKeySecret,
    customerEmail,
    onError
  ]);
  
  // Initialize PaymentSheet when we have client secret
  useEffect(() => {
    if (clientSecret) {
      initializePaymentSheet();
    }
  }, [clientSecret, initializePaymentSheet]);


  const handleSetup = useCallback(async () => {
    if (!isReady) {
      Alert.alert('Setup not ready', 'Please wait for setup to initialize');
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await presentPaymentSheet();

      if (error) {
        if (error.code === 'Canceled') {
          // User canceled, just return without calling onError
          return;
        }
        throw new Error(error.message);
      }

      // Setup succeeded
      onSuccess();

    } catch (error) {
      onError(error instanceof Error ? error : new Error('Failed to save payment method'));
    } finally {
      setIsProcessing(false);
    }
  }, [isReady, presentPaymentSheet, onSuccess, onError]);

  if (setupMutation.isPending || !clientSecret) {
    return (
      <YStack alignItems="center" justifyContent="center" padding="$4" gap="$3">
        <Spinner size="large" color="$primary" />
        <Text fontSize="$3" color="$mutedForeground">
          Setting up payment method...
        </Text>
      </YStack>
    );
  }

  if (setupMutation.isError) {
    return (
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
        <Text fontSize="$3" color="$error" flex={1}>
          Failed to initialize payment setup. Please try again.
        </Text>
      </XStack>
    );
  }

  if (!isReady) {
    return (
      <YStack alignItems="center" justifyContent="center" padding="$4" gap="$3">
        <Spinner size="large" color="$primary" />
        <Text fontSize="$3" color="$mutedForeground">
          Loading payment form...
        </Text>
      </YStack>
    );
  }

  return (
    <YStack gap="$4" padding="$4">
      <YStack gap="$3">
        <XStack alignItems="center" gap="$2">
          <ThemedIonicons name="card-outline" size={20} themeColor="foreground" />
          <Text fontSize="$4" fontWeight="600" color="$foreground">
            Add Payment Method
          </Text>
        </XStack>
        
        <Text fontSize="$3" color="$mutedForeground">
          Save a payment method for faster checkout and subscriptions
        </Text>
      </YStack>

      <Button
        size="$4"
        disabled={isProcessing}
        onPress={handleSetup}
        backgroundColor="$primary"
        color="$foreground"
        pressStyle={{ backgroundColor: '$primary', opacity: 0.8 }}
      >
        <XStack alignItems="center" gap="$2">
          {isProcessing && <Spinner size="small" color="$foreground" />}
          <ThemedIonicons name="add-circle-outline" size={20} color="$foreground" />
          <Text color="$foreground" fontWeight="600">
            {isProcessing ? 'Saving...' : 'Add Payment Method'}
          </Text>
        </XStack>
      </Button>

      <Text fontSize="$2" color="$mutedForeground" textAlign="center">
        Your payment information is securely processed by Stripe
      </Text>
    </YStack>
  );
});

StripeSetupPaymentMethod.displayName = 'StripeSetupPaymentMethod';