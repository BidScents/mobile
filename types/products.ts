/**
 * Product and pricing types from the payments API
 */

// Re-export SDK types for use in the app
export type { ProductResponse, Boost, Pass } from "@bid-scents/shared-sdk";

/**
 * Payment method details from the payments API
 */
export interface PaymentMethodResponse {
  brand: string;
  last4: string;
}

/**
 * Subscription plan for UI display (transformed from API data)
 */
export interface SubscriptionPlan {
  id: string;
  type: 'weekly_swap' | 'monthly_swap' | 'yearly_swap';
  title: string;
  subtitle: string;
  price: string;
  billing: string;
  features: string[];
  popular: boolean;
  rawPrice: number; // Price in cents
  duration: number; // Duration in days
  freeTrialDays: number;
}