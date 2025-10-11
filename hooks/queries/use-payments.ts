import type { PaymentMethodResponse, ProductResponse } from "@/types/products";
import { AuthService } from "@/utils/auth-service";
import type {
  BoostRequest,
  MessageResData,
  PaymentResponse,
  ReviewRequest,
  SubscriptionRequest,
  TransactionRequest
} from "@bid-scents/shared-sdk";
import { PaymentsService } from "@bid-scents/shared-sdk";
import {
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";
import { Alert } from "react-native";
import { queryKeys } from "./query-keys";
import { updateAllMessageCaches } from "./use-messages";

// ========================================
// ERROR HANDLING HELPERS
// ========================================

/**
 * Maps boost-related errors to user-friendly messages
 * Removes internal listing IDs and provides actionable feedback
 */
function getBoostErrorMessage(error: any): string {
  const status = error?.status;
  const detail = error?.body?.detail || '';

  // Network or server errors
  if (!status || status >= 500) {
    return 'Connection issue. Please check your internet and try again.';
  }

  // Client errors - map based on status and detail patterns
  switch (status) {
    case 404:
      return "One of your listings couldn't be found. Please refresh and try again.";
    
    case 403:
      return "You can only boost listings that you own.";
    
    case 400:
      if (detail.includes('is not active')) {
        return "Some of your listings are no longer active and can't be boosted.";
      }
      if (detail.includes('swap listing')) {
        return "Swap listings cannot be boosted. Only sale listings can be promoted.";
      }
      return "Unable to boost listing. Please check your listing status and try again.";
    
    default:
      return "Unable to boost listing right now. Please try again later.";
  }
}

// ========================================
// LISTING BOOST MUTATIONS
// ========================================

/**
 * Create payment intent for boosting a listing
 * Returns payment intent client secret for processing
 */
export function useBoostListing() {
  const queryClient = useQueryClient();
  

  return useMutation({
    mutationFn: (boostRequest: BoostRequest, creditsOnly?: boolean) =>
      PaymentsService.boostListingV1PaymentsBoostPost(boostRequest, creditsOnly),
    onSuccess: async (response: PaymentResponse, boostRequest: BoostRequest, creditsOnly?: boolean) => {
      // Invalidate listing details for all boosted listings
      Object.values(boostRequest.boosts).flat().forEach((listingId) => {
        queryClient.invalidateQueries({
          queryKey: queryKeys.listings.detail(listingId),
        });
      });
      
      // Invalidate dashboard listings to reflect boost status
      queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard.listings.all,
      });
      
      // Invalidate homepage to show boosted listing in featured section
      queryClient.invalidateQueries({
        queryKey: queryKeys.homepage,
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard.listings.featured,
      });

      // Note: AuthService.refreshCurrentUser() is now called conditionally at component level
      // - When credits used: called immediately
      // - When payment required: called after payment success
    },
    onError: (error: any) => {
      console.error('Failed to boost listing:', error);
      console.log("error", error.message)
      
      // Get user-friendly error message without exposing listing IDs
      const userMessage = getBoostErrorMessage(error);
      
      Alert.alert('Error', userMessage);
      console.warn('User-friendly boost error:', userMessage);
    },
  });
}

/**
 * Cancel boost credits
 */
export function useCancelBoostCredits(requestId: string) {
  return useMutation({
    mutationFn: () => PaymentsService.cancelRequestV1PaymentsBoostDelete(requestId),
    onSuccess: async () => {
      // Refresh auth state to update payment details
      try {
        await AuthService.refreshCurrentUser();
      } catch (error) {
        console.error('Failed to refresh user after boost credits cancellation:', error);
      }
    },
  });
}

/**
 * Claim boost credits
 * @param requestId - ID of the boost request to claim
 * @param listingId - ID of the listing to boost
 */
export function useClaimBoost() {
  return useMutation({
    mutationFn: ({ requestId, listingId }: { requestId: string; listingId: string }) => 
      PaymentsService.claimBoostV1PaymentsBoostClaimPost({ request_id: requestId, listing_id: listingId} ),
    onSuccess: async () => {
      console.log('Boost claimed successfully')
    },
    onError: (error: any) => {
      console.error('Failed to claim boost:', error);
    },
  });
}

// ========================================
// PAYMENT METHOD MUTATIONS
// ========================================

/**
 * Get user's payment method details
 * Returns payment method information
 */
export function useGetPaymentMethod() {
  return useQuery<PaymentMethodResponse>({
    queryKey: queryKeys.payments.paymentMethod,
    queryFn: () => PaymentsService.getPaymentMethodV1PaymentsPaymentMethodGet(),
  });
}

/**
 * Setup payment method for user
 * Returns a client secret for payment method setup
 */
export function useSetupPaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => PaymentsService.setupPaymentMethodV1PaymentsPaymentMethodPost(),
    onSuccess: () => {
      // Invalidate payment method status to reflect new setup
      queryClient.invalidateQueries({
        queryKey: queryKeys.payments.paymentMethod,
      });
    },
  });
}

/**
 * Delete user's payment method
 */
export function useDeletePaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => PaymentsService.deletePaymentMethodV1PaymentsPaymentMethodDelete(),
    onSuccess: async () => {
      // Invalidate payment method status to reflect deletion
      queryClient.invalidateQueries({
        queryKey: queryKeys.payments.paymentMethod,
      });
      

      // Refresh auth state to update payment details
      try {
        await AuthService.refreshCurrentUser();
      } catch (error) {
        console.error('Failed to refresh user after payment method deletion:', error);
      }
    },
  });
}

/**
 * Update user's payment method
 * @param paymentMethodId - New payment method ID to update to
 */
export function useUpdatePaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paymentMethodId: string) => 
      PaymentsService.updatePaymentMethodV1PaymentsPaymentMethodPatch(paymentMethodId),
    onSuccess: async () => {
      // Invalidate payment method status to reflect update
      queryClient.invalidateQueries({
        queryKey: queryKeys.payments.paymentMethod,
      });

      // Refresh auth state to update payment details
      try {
        await AuthService.refreshCurrentUser();
      } catch (error) {
        console.error('Failed to refresh user after payment method update:', error);
      }
    },
  });
}

// ========================================
// SUBSCRIPTION MUTATIONS
// ========================================

/**
 * Create or update swap pass subscription
 */
export function useCreateSubscription() {
  return useMutation({
    mutationFn: (subscriptionRequest: SubscriptionRequest) =>
      PaymentsService.createSubscriptionV1PaymentsSubscriptionPost(subscriptionRequest),
    onSuccess: async () => {
      // Refresh auth state to update payment details and subscription status
      try {
        await AuthService.refreshCurrentUser();
      } catch (error) {
        console.error('Failed to refresh user after subscription creation:', error);
      }
    },
  });
}

/**
 * Cancel user's subscription
 */
export function useCancelSubscription() {
  return useMutation({
    mutationFn: () => PaymentsService.cancelSubscriptionV1PaymentsSubscriptionDelete(),
    onSuccess: async () => {
      // Refresh auth state to update subscription status
      try {
        await AuthService.refreshCurrentUser();
      } catch (error) {
        console.error('Failed to refresh user after subscription cancellation:', error);
      }
    },
  });
}

// ========================================
// PRODUCT QUERIES
// ========================================

/**
 * List available products from Stripe
 * Returns product and pricing information
 */
export function useListProducts() {
  return useQuery<ProductResponse>({
    queryKey: queryKeys.payments.products,
    queryFn: () => PaymentsService.listProductsV1PaymentsProductsGet(),
  });
}

// ========================================
// CONNECT ACCOUNT MUTATIONS
// ========================================

/**
 * Onboard user's Stripe Connect account for selling
 * Returns onboarding URL for Stripe Connect flow
 */
export function useOnboardConnectAccount() {
  return useMutation({
    mutationFn: ({ refreshUrl, returnUrl }: { refreshUrl: string; returnUrl: string }) =>
      PaymentsService.onboardConnectAccountV1PaymentsConnectOnboardPost(refreshUrl, returnUrl),
  });
}

// ========================================
// TRANSACTION MUTATIONS
// ========================================

/**
 * Create a new transaction in a conversation
 * Used when seller creates a transaction for a listing
 */
export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (transactionRequest: TransactionRequest) =>
      PaymentsService.createTransactionV1PaymentsTransactionPost(transactionRequest),
    onSuccess: (message: MessageResData) => {
      // Update message caches with the new transaction message
      updateAllMessageCaches(
        queryClient,
        message.conversation_id,
        message
      );
    },
    onError: (error: any) => {
      console.error('Failed to create transaction:', error);

      // Parse error message for user display
      const errorMessage =
        error?.body?.detail || error?.message || 'Failed to create transaction';

      // You can emit a toast or error event here
      // For now, just log the user-friendly error
      Alert.alert('Error', errorMessage);
      console.warn('User-friendly error:', errorMessage);
    },
    retry: false,
  });
}

/**
 * Accept a transaction (buyer accepts seller's offer)
 * Returns payment intent for processing payment
 */
export function useAcceptTransaction() {
  return useMutation({
    mutationFn: ({ messageId }: { messageId: string }) =>
      PaymentsService.acceptTransactionV1PaymentsMessageIdAcceptPost(messageId),
    onError: (error: any) => {
      console.error('Failed to accept transaction:', error);

      // Parse error message for user display
      const errorMessage =
        error?.body?.detail ||
        error?.message ||
        'Failed to accept transaction';

      // You can emit a toast or error event here
      Alert.alert('Error', errorMessage);
      console.warn('User-friendly error:', errorMessage);
    },
    retry: (failureCount, error: any) => {
      // Don't retry on 4xx errors (client errors)
      if (error?.status >= 400 && error?.status < 500) {
        return false;
      }
      // Retry up to 2 times for 5xx errors or network errors
      return failureCount < 2;
    },
  });
}

/**
 * Cancel a transaction after it has been initiated
 * Can be called by either buyer or seller
 */
export function useCancelTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ messageId }: { messageId: string }) =>
      PaymentsService.cancelTransactionV1PaymentsMessageIdCancelDelete(messageId),
    onSuccess: (_, { messageId, updatedMessage }: { messageId: string; updatedMessage: MessageResData }) => {
            
      // Update message caches with the cancelled transaction message
      updateAllMessageCaches(
        queryClient,
        updatedMessage.conversation_id,
        updatedMessage,
        true // shouldUpdate = true to update existing message
      );
    },
  });
}

/**
 * Confirm receipt of item (buyer confirms they received the item)
 * This releases payment to the seller
 */
export function useConfirmReceipt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ messageId }: { messageId: string }) =>
      PaymentsService.confirmReceiptV1PaymentsMessageIdConfirmReceiptPost(messageId),
    onSuccess: (_, { messageId, updatedMessage }: { messageId: string; updatedMessage: MessageResData }) => {
      // Update message caches with the confirmed receipt message
      updateAllMessageCaches(
        queryClient,
        updatedMessage.conversation_id,
        updatedMessage,
        true // shouldUpdate = true to update existing message
      );
    },
  });
}

/**
 * Submit a review for a completed transaction
 * Called after buyer confirms receipt
 */
export function useSubmitReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ messageId, reviewRequest, updatedMessage }: { messageId: string; reviewRequest: ReviewRequest; updatedMessage: MessageResData }) =>
      PaymentsService.submitReviewV1PaymentsMessageIdSubmitReviewPost(messageId, reviewRequest),
    onSuccess: (_, { messageId, updatedMessage }: { messageId: string; reviewRequest: ReviewRequest; updatedMessage: MessageResData }) => {
      // Update message caches with the submitted review message
      updateAllMessageCaches(
        queryClient,
        updatedMessage.conversation_id,
        updatedMessage,
        true // shouldUpdate = true to update existing message
      );
    },
  });
}