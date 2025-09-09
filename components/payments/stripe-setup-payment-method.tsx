import { ThemedIonicons } from '@/components/ui/themed-icons';
import { useSetupPaymentMethod } from '@/hooks/queries/use-payments';
import { useLoadingStore } from '@bid-scents/shared-sdk';
import {
  useStripe
} from '@stripe/stripe-react-native';
import { memo, useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { Text, XStack } from 'tamagui';

interface StripeSetupPaymentMethodProps {
  /** Customer email for the setup */
  customerEmail?: string;
  /** Customer ID from your backend */
  customerId?: string;
  /** Ephemeral key secret for customer */
  ephemeralKeySecret?: string;
  /** Called when setup succeeds - now receives the payment method ID */
  onSuccess: (paymentMethodId: string) => void;
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
  const { initPaymentSheet, presentPaymentSheet, retrieveSetupIntent } = useStripe();
  const { showLoading, hideLoading } = useLoadingStore();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

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

        // Default billing details with Malaysia as default country
        defaultBillingDetails: {
          email: customerEmail,
          address: {
            country: 'MY', // Default to Malaysia
          },
        },

        // Enable Google Pay for Malaysian users
        googlePay: {
          merchantCountryCode: 'MY',
          currencyCode: 'MYR',
          testEnv: __DEV__, // Use test environment in development
        },

        // Payment method configuration for Malaysia
        // Note: FPX and GrabPay don't support Setup Intents (saving for subscriptions)
        // Only card payments can be saved for recurring subscriptions
        // paymentMethodOrder: ['card'], // Keeping only card for setup intents

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

  const handleSetup = useCallback(async () => {
    if (!isReady || !clientSecret) {
      Alert.alert('Setup not ready', 'Please wait for setup to initialize');
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await presentPaymentSheet();

      if (error) {
        if (error.code === 'Canceled') {
          // User canceled, call onError to reset state
          hideLoading();
          onError(new Error('USER_CANCELLED'));
          return;
        }
        throw new Error(error.message);
      }

      // Setup succeeded - now retrieve the setup intent to get payment method ID
      const { setupIntent: retrievedSetupIntent, error: retrieveError } = await retrieveSetupIntent(clientSecret);
      
      if (retrieveError) {
        throw new Error(`Failed to retrieve setup intent: ${retrieveError.message}`);
      }
      
      if (!retrievedSetupIntent) {
        throw new Error('Setup intent not found after completion');
      }

      // Extract payment method ID - prefer the newer paymentMethod.id over deprecated paymentMethodId
      const paymentMethodId = retrievedSetupIntent.paymentMethod?.id;
      
      if (!paymentMethodId) {
        throw new Error('Payment method ID not found after setup');
      }

      hideLoading();
      onSuccess(paymentMethodId);

    } catch (error) {
      hideLoading();
      onError(error instanceof Error ? error : new Error('Failed to save payment method'));
    } finally {
      setIsProcessing(false);
    }
  }, [isReady, clientSecret, presentPaymentSheet, retrieveSetupIntent, onSuccess, onError, hideLoading]);

  // Auto-present payment sheet when ready
  useEffect(() => {
    if (isReady && !isProcessing) {
      showLoading();
      handleSetup();
    }
  }, [isReady, isProcessing, handleSetup, showLoading]);
  
  // Initialize PaymentSheet when we have client secret
  useEffect(() => {
    if (clientSecret) {
      initializePaymentSheet();
    }
  }, [clientSecret, initializePaymentSheet]);

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

  // All loading states handled by global loading overlay
  return null;
});

StripeSetupPaymentMethod.displayName = 'StripeSetupPaymentMethod';