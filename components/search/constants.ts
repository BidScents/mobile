import { ListingBoxCondition, ListingCategory, ListingType } from "@bid-scents/shared-sdk";

export const LISTING_TYPE_LABELS = {
  [ListingType.FIXED_PRICE]: "Fixed Price",
  [ListingType.NEGOTIABLE]: "Negotiable",
  [ListingType.AUCTION]: "Auction",
  [ListingType.SWAP]: "Swap",
} as const;

export const CATEGORY_LABELS = {
  [ListingCategory.DESIGNER]: "Designer",
  [ListingCategory.LOCAL]: "Local",
  [ListingCategory.ARABIAN_HOUSE]: "Arabian House",
  [ListingCategory.NICHE]: "Niche",
} as const;

export const BOX_CONDITION_LABELS = {
  [ListingBoxCondition.GOOD]: "Good",
  [ListingBoxCondition.DAMAGED]: "Damaged",
  [ListingBoxCondition.NO_BOX]: "No Box",
} as const;