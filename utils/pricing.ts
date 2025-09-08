import type { PassInfo, ProductsResponse, SubscriptionPlan } from "@/types/products";
import { PassType } from "@bid-scents/shared-sdk";
import { currency } from "../constants/constants";
/**
 * Convert price from cents to display format
 * @param cents - Price in cents (e.g., 890)
 * @returns Formatted price string (e.g., "RM 8.90")
 */
export function formatPrice(cents: number): string {
  const ringgit = cents / 100;
  return `${currency} ${ringgit.toFixed(2)}`;
}

/**
 * Get billing period display text
 * @param duration - Duration in days
 * @returns Billing period string (e.g., "/month", "/week", "/year")
 */
function getBillingPeriod(duration: number): string {
  if (duration <= 7) return "/week";
  if (duration <= 31) return "/month";
  return "/year";
}

/**
 * Generate feature list from pass info
 * @param passInfo - Pass information from API
 * @param boostsInfo - Boost pricing info for context
 * @returns Array of feature strings
 */
function generateFeatures(passInfo: PassInfo, boostsInfo: ProductsResponse["boosts"]): string[] {
  const features: string[] = [];

  // Add free trial if available
  if (passInfo.free_trial > 0) {
    features.push(`${passInfo.free_trial} days free trial`);
  }

  // Add boost credits
  if (passInfo.boost_credits.normal_boost > 0) {
    const duration = boostsInfo.normal_boost.duration;
    features.push(`${passInfo.boost_credits.normal_boost} x ${duration}h boost credit${passInfo.boost_credits.normal_boost > 1 ? 's' : ''}`);
  }

  if (passInfo.boost_credits.premium_boost > 0) {
    const duration = boostsInfo.premium_boost.duration;
    features.push(`${passInfo.boost_credits.premium_boost} x ${duration}h boost credit${passInfo.boost_credits.premium_boost > 1 ? 's' : ''}`);
  }

  // If no boost credits, just show swap access
  if (passInfo.boost_credits.normal_boost === 0 && passInfo.boost_credits.premium_boost === 0) {
    features.push("Swap Access");
  }

  return features;
}

/**
 * Transform API products data to subscription plans for UI
 * @param productsData - Products response from API
 * @returns Array of subscription plans for display
 */
export function transformProductsToPlans(productsData: ProductsResponse): SubscriptionPlan[] {
  const { passes, boosts } = productsData;

  return [
    // Weekly Plan
    {
      id: passes.weekly_swap.id,
      type: 'weekly_swap' as const,
      title: "Weekly Swap Pass",
      subtitle: "Perfect for active swappers",
      price: formatPrice(passes.weekly_swap.price),
      billing: getBillingPeriod(passes.weekly_swap.duration),
      features: generateFeatures(passes.weekly_swap, boosts),
      popular: false,
      rawPrice: passes.weekly_swap.price,
      duration: passes.weekly_swap.duration,
      freeTrialDays: passes.weekly_swap.free_trial,
    },

    // Monthly Plan
    {
      id: passes.monthly_swap.id,
      type: 'monthly_swap' as const,
      title: "Monthly Swap Pass",
      subtitle: "Most popular choice",
      price: formatPrice(passes.monthly_swap.price),
      billing: getBillingPeriod(passes.monthly_swap.duration),
      features: generateFeatures(passes.monthly_swap, boosts),
      popular: true,
      rawPrice: passes.monthly_swap.price,
      duration: passes.monthly_swap.duration,
      freeTrialDays: passes.monthly_swap.free_trial,
    },

    // Yearly Plan
    {
      id: passes.yearly_swap.id,
      type: 'yearly_swap' as const,
      title: "Yearly Swap Pass",
      subtitle: "Maximum savings",
      price: formatPrice(passes.yearly_swap.price),
      billing: getBillingPeriod(passes.yearly_swap.duration),
      features: generateFeatures(passes.yearly_swap, boosts),
      popular: false,
      rawPrice: passes.yearly_swap.price,
      duration: passes.yearly_swap.duration,
      freeTrialDays: passes.yearly_swap.free_trial,
    },
  ];
}

/**
 * Map subscription plan type to PassType enum
 * @param planType - Plan type from subscription plan
 * @returns PassType enum value
 */
export function mapPlanTypeToPassType(planType: SubscriptionPlan['type']): PassType {
  switch (planType) {
    case 'weekly_swap':
      return PassType.WEEKLY_SWAP;
    case 'monthly_swap':
      return PassType.MONTHLY_SWAP;
    case 'yearly_swap':
      return PassType.YEARLY_SWAP;
    default:
      throw new Error(`Unknown plan type: ${planType}`);
  }
}