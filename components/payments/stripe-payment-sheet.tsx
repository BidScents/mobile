import { ThemedIonicons } from '@/components/ui/themed-icons';
import {
  useStripe
} from '@stripe/stripe-react-native';
import { memo, useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { Button, Spinner, Text, XStack, YStack } from 'tamagui';

interface StripePaymentSheetProps {
  /** Client secret from PaymentIntent */
  clientSecret: string;
  /** Payment amount in cents */
  amount: number;
  /** Payment currency */
  currency: string;
  /** Customer email for receipt */
  customerEmail?: string;
  /** Customer ID from your backend */
  customerId?: string;
  /** Ephemeral key secret for customer */
  ephemeralKeySecret?: string;
  /** Called when payment succeeds */
  onSuccess: () => void;
  /** Called when payment fails */
  onError: (error: Error) => void;
  /** Called when user cancels */
  onCancel?: () => void;
}

/**
 * Complete Stripe payment form using PaymentSheet
 * Handles payment processing for transactions with Apple Pay, Google Pay, and cards
 */
export const StripePaymentSheet = memo<StripePaymentSheetProps>(({
  clientSecret,
  amount,
  currency,
  customerEmail,
  customerId,
  ephemeralKeySecret,
  onSuccess,
  onError,
  onCancel
}) => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [isReady, setIsReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const initializePaymentSheet = useCallback(async () => {
    try {
      const { error } = await initPaymentSheet({
        merchantDisplayName: 'BidScents',
        paymentIntentClientSecret: clientSecret,
        
        // Customer configuration (optional - enables saved payment methods)
        ...(customerId && ephemeralKeySecret && {
          customerId,
          customerEphemeralKeySecret: ephemeralKeySecret,
        }),

        // Enable Apple Pay and Google Pay for Malaysia
        // applePay: {
        //   merchantCountryCode: 'MY',
        // },
        googlePay: {
          merchantCountryCode: 'MY', // Changed to Malaysia
          testEnv: __DEV__, // Use test environment in development
          currencyCode: currency.toUpperCase(),
        },

        // Default billing details with Malaysia as default country
        defaultBillingDetails: {
          email: customerEmail,
          address: {
            country: 'MY', // Default to Malaysia
          },
        },

        // Payment method configuration for Malaysia
        // Include card, FPX, and other Malaysian payment methods
        paymentMethodOrder: ['card', 'fpx', 'grabpay'],

        // UI customization
        // Use system theme colors - Stripe will adapt to device theme automatically

        // Allow future payments (saves payment methods)
        allowsDelayedPaymentMethods: true,
        returnURL: 'com.bidscents.mobile://payment/return',
      });

      if (error) {
        throw new Error(error.message);
      }

      setIsReady(true);
    } catch (error) {
      onError(error instanceof Error ? error : new Error('Failed to initialize payment'));
    }
  }, [
    initPaymentSheet,
    clientSecret,
    customerId,
    ephemeralKeySecret,
    customerEmail,
    currency,
    onError
  ]);

  // Initialize PaymentSheet when component mounts
  useEffect(() => {
    initializePaymentSheet();
  }, [initializePaymentSheet]);


  const handlePayment = useCallback(async () => {
    if (!isReady) {
      Alert.alert('Payment not ready', 'Please wait for payment to initialize');
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await presentPaymentSheet();

      if (error) {
        if (error.code === 'Canceled') {
          onCancel?.();
          return;
        }
        throw new Error(error.message);
      }

      // Payment succeeded
      onSuccess();

    } catch (error) {
      onError(error instanceof Error ? error : new Error('Payment failed'));
    } finally {
      setIsProcessing(false);
    }
  }, [isReady, presentPaymentSheet, onSuccess, onError, onCancel]);

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  if (!isReady) {
    return (
      <YStack alignItems="center" justifyContent="center" padding="$4" gap="$3">
        <Spinner size="large" color="$primary" />
        <Text fontSize="$3" color="$mutedForeground">
          Setting up payment...
        </Text>
      </YStack>
    );
  }

  return (
    <YStack gap="$4" padding="$4">
      <YStack gap="$3">
        <Text fontSize="$4" fontWeight="600" color="$foreground">
          Complete Payment
        </Text>
        
        <XStack justifyContent="space-between" alignItems="center">
          <Text fontSize="$3" color="$mutedForeground">Total:</Text>
          <Text fontSize="$4" fontWeight="600" color="$foreground">
            {formatAmount(amount, currency)}
          </Text>
        </XStack>
      </YStack>

      <Button
        size="$4"
        disabled={isProcessing}
        onPress={handlePayment}
        backgroundColor="$primary"
        color="$foreground"
        pressStyle={{ backgroundColor: '$primary', opacity: 0.8 }}
      >
        <XStack alignItems="center" gap="$2">
          {isProcessing && <Spinner size="small" color="$foreground" />}
          <ThemedIonicons name="card-outline" size={20} color="$foreground" />
          <Text color="$foreground" fontWeight="600">
            {isProcessing ? 'Processing...' : `Pay ${formatAmount(amount, currency)}`}
          </Text>
        </XStack>
      </Button>

      <Text fontSize="$2" color="$mutedForeground" textAlign="center">
        Your payment is secured by Stripe
      </Text>
    </YStack>
  );
});

StripePaymentSheet.displayName = 'StripePaymentSheet';