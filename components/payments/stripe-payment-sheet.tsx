import {
  useStripe
} from '@stripe/stripe-react-native';
import * as Linking from 'expo-linking';
import { memo, useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';

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
  /** Return URL for payment */
  returnURL?: string;
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
  onCancel,
  returnURL
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
        returnURL: returnURL || Linking.createURL('(tabs)/profile/seller-dashboard'),
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
    onError,
    returnURL
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

  // Auto-present payment sheet when ready
  useEffect(() => {
    if (isReady && !isProcessing) {
      handlePayment();
    }
  }, [isReady, isProcessing, handlePayment]);

  // All loading states handled by global loading overlay or component state
  return null;
});

StripePaymentSheet.displayName = 'StripePaymentSheet';