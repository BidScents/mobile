import type {
  BoostRequest,
  ConversationResponse,
  MessageResData,
  MessagesSummary,
  PaymentResponse,
  ReviewRequest,
  SubscriptionRequest,
  TransactionRequest
} from "@bid-scents/shared-sdk";
import { PaymentsService } from "@bid-scents/shared-sdk";
import {
  useMutation,
  useQueryClient
} from "@tanstack/react-query";
import { queryKeys } from "./query-keys";

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

// ========================================
// SUBSCRIPTION MUTATIONS
// ========================================

/**
 * Create or update swap pass subscription
 */
export function useCreateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (subscriptionRequest: SubscriptionRequest) =>
      PaymentsService.createSubscriptionV1PaymentsSubscriptionPost(subscriptionRequest),
    onSuccess: () => {
      // Invalidate subscription status
      queryClient.invalidateQueries({
        queryKey: queryKeys.payments.subscription,
      });
    },
  });
}

/**
 * Cancel user's subscription
 */
export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => PaymentsService.cancelSubscriptionV1PaymentsSubscriptionDelete(),
    onSuccess: () => {
      // Invalidate subscription status
      queryClient.invalidateQueries({
        queryKey: queryKeys.payments.subscription,
      });
    },
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
// CACHE HELPERS FOR TRANSACTIONS
// ========================================

/**
 * Updates message caches when a transaction is created or updated
 * Ensures transaction messages appear in conversations
 */
function updateMessageCachesWithTransaction(
  queryClient: ReturnType<typeof useQueryClient>,
  conversationId: string,
  message: MessageResData
) {
  // Update conversation cache with new transaction message
  queryClient.setQueryData(
    queryKeys.messages.conversation(conversationId),
    (old: ConversationResponse | undefined) => {
      if (!old) return old;
      return {
        ...old,
        messages: [message, ...old.messages],
      };
    }
  );

  // Update conversation summary cache
  queryClient.setQueryData(
    queryKeys.messages.summary,
    (old: MessagesSummary | undefined) => {
      if (!old) return old;

      return {
        ...old,
        conversations: old.conversations.map((conv) =>
          conv.id === conversationId
            ? {
                ...conv,
                last_message: message,
              }
            : conv
        ),
      };
    }
  );
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
      updateMessageCachesWithTransaction(
        queryClient,
        message.conversation_id,
        message
      );
      
      // Invalidate conversation to ensure fresh data
      queryClient.invalidateQueries({
        queryKey: queryKeys.messages.conversation(message.conversation_id),
      });
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
    mutationFn: (messageId: string) =>
      PaymentsService.acceptTransactionV1PaymentsMessageIdAcceptPost(messageId),
    onSuccess: (response: PaymentResponse, messageId: string) => {
      // Invalidate transaction-specific queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.payments.transaction(messageId),
      });
      
      // Find the conversation this transaction belongs to and invalidate
      // Note: We'd need the conversation ID, which might need to be passed or derived
      queryClient.invalidateQueries({
        queryKey: queryKeys.messages.all,
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
    mutationFn: (messageId: string) =>
      PaymentsService.cancelTransactionV1PaymentsMessageIdCancelDelete(messageId),
    onSuccess: (_, messageId: string) => {
      // Invalidate transaction-specific queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.payments.transaction(messageId),
      });
      
      // Invalidate all message-related queries to reflect cancellation
      queryClient.invalidateQueries({
        queryKey: queryKeys.messages.all,
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