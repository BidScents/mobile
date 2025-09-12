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
import { queryKeys } from "./query-keys";
import { updateAllMessageCaches } from "./use-messages";

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
    mutationFn: (boostRequest: BoostRequest) =>
      PaymentsService.boostListingV1PaymentsBoostPost(boostRequest),
    onSuccess: (response: PaymentResponse, boostRequest: BoostRequest) => {
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ refreshUrl, returnUrl }: { refreshUrl: string; returnUrl: string }) =>
      PaymentsService.onboardConnectAccountV1PaymentsConnectOnboardPost(refreshUrl, returnUrl),
    onSuccess: () => {
      // Invalidate connect account status
      queryClient.invalidateQueries({
        queryKey: queryKeys.payments.connectAccount,
      });
    },
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
      
      // // Invalidate conversation to ensure fresh data
      // queryClient.invalidateQueries({
      //   queryKey: queryKeys.messages.conversation(message.conversation_id),
      // });
    },
  });
}

/**
 * Accept a transaction (buyer accepts seller's offer)
 * Returns payment intent for processing payment
 */
export function useAcceptTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ messageId }: { messageId: string }) =>
      PaymentsService.acceptTransactionV1PaymentsMessageIdAcceptPost(messageId),
    onSuccess: (response: PaymentResponse, { messageId, updatedMessage }: { messageId: string; updatedMessage: MessageResData }) => {
      // // Update message caches with the accepted transaction message
      // updateAllMessageCaches(
      //   queryClient,
      //   updatedMessage.conversation_id,
      //   updatedMessage,
      //   true // shouldUpdate = true to update existing message
      // );
      
      // Invalidate transaction-specific queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.payments.transaction(messageId),
      });
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
      
      // Invalidate transaction-specific queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.payments.transaction(messageId),
      });
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
    mutationFn: (messageId: string) =>
      PaymentsService.confirmReceiptV1PaymentsMessageIdConfirmReceiptPost(messageId),
    onSuccess: (_, messageId: string) => {
      // Invalidate transaction-specific queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.payments.transaction(messageId),
      });
      
      // Invalidate all message-related queries to reflect confirmation
      queryClient.invalidateQueries({
        queryKey: queryKeys.messages.all,
      });
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
    mutationFn: ({ messageId, reviewRequest }: { messageId: string; reviewRequest: ReviewRequest }) =>
      PaymentsService.submitReviewV1PaymentsMessageIdSubmitReviewPost(messageId, reviewRequest),
    onSuccess: (_, { messageId }) => {
      // Invalidate transaction-specific queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.payments.transaction(messageId),
      });
      
      // Invalidate all message-related queries to reflect review submission
      queryClient.invalidateQueries({
        queryKey: queryKeys.messages.all,
      });
      
      // Invalidate profile queries to reflect new reviews
      queryClient.invalidateQueries({
        queryKey: queryKeys.profile.all,
      });
    },
  });
}