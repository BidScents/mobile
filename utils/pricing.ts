import type { ProductResponse, Pass, Boost, SubscriptionPlan } from "@/types/products";
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
function generateFeatures(passInfo: Pass, boostsInfo: Record<string, Boost>): string[] {
  const features: string[] = [];

  // Add free trial if available
  if (passInfo.free_trial > 0) {
    features.push(`${passInfo.free_trial} days free trial`);
  }

  // Add boost credits for each boost type
  let hasBoostCredits = false;
  
  Object.entries(passInfo.boost_credits).forEach(([boostType, credits]) => {
    if (credits > 0) {
      hasBoostCredits = true;
      const boostInfo = boostsInfo[boostType];
      if (boostInfo) {
        const duration = boostInfo.duration;
        features.push(`${credits} x ${duration}h ${boostType.replace('_', ' ')} credit${credits > 1 ? 's' : ''}`);
      }
    }
  });

  // If no boost credits, just show swap access
  if (!hasBoostCredits) {
    features.push("Swap Access");
  }

  return features;
}

/**
 * Transform API products data to subscription plans for UI
 * @param productsData - Products response from API
 * @returns Array of subscription plans for display
 */
export function transformProductsToPlans(productsData: ProductResponse): SubscriptionPlan[] {
  const { passes, boosts } = productsData;

  // Convert passes object to array and sort by duration (weekly, monthly, yearly)
  const passEntries = Object.entries(passes).sort(([, a], [, b]) => a.duration - b.duration);

  return passEntries.map(([passKey, passInfo], index) => {
    // Determine plan type based on duration
    let planType: 'weekly_swap' | 'monthly_swap' | 'yearly_swap';
    let title: string;
    let subtitle: string;
    let popular = false;

    if (passInfo.duration <= 7) {
      planType = 'weekly_swap';
      title = "Weekly Swap Pass";
      subtitle = "Perfect for active swappers";
    } else if (passInfo.duration <= 31) {
      planType = 'monthly_swap';
      title = "Monthly Swap Pass";
      subtitle = "Most popular choice";
      popular = true; // Monthly is typically the most popular
    } else {
      planType = 'yearly_swap';
      title = "Yearly Swap Pass";
      subtitle = "Maximum savings";
    }

    return {
      id: passInfo.id,
      type: planType,
      title,
      subtitle,
      price: formatPrice(passInfo.price),
      billing: getBillingPeriod(passInfo.duration),
      features: generateFeatures(passInfo, boosts),
      popular,
      rawPrice: passInfo.price,
      duration: passInfo.duration,
      freeTrialDays: passInfo.free_trial,
    };
  });
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