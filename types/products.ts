/**
 * Product and pricing types from the payments API
 */

export interface BoostCredits {
  normal_boost: number;
  premium_boost: number;
}

export interface BoostInfo {
  duration: number;
  normal_price: number;
  bulk_price: number;
  bulk_limit: number;
}

export interface PassInfo {
  id: string;
  price: number;
  boost_credits: BoostCredits;
  duration: number;
  free_trial: number;
}

export interface ProductsResponse {
  boosts: {
    normal_boost: BoostInfo;
    premium_boost: BoostInfo;
  };
  passes: {
    weekly_swap: PassInfo;
    monthly_swap: PassInfo;
    yearly_swap: PassInfo;
  };
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