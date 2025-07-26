import {
    ListingBoxCondition,
    ListingCategory,
    ListingType,
} from "@bid-scents/shared-sdk";

/**
 * Options for listing type
 */
export const listingTypeOptions = [
  { label: "Fixed Price", value: ListingType.FIXED_PRICE },
  { label: "Negotiable", value: ListingType.NEGOTIABLE },
  { label: "Auction", value: ListingType.AUCTION },
  { label: "Swap", value: ListingType.SWAP },
];

/**
 * Options for category
 */
export const categoryOptions = [
  { label: "Designer", value: ListingCategory.DESIGNER },
  { label: "Local", value: ListingCategory.LOCAL },
  { label: "Arabian House", value: ListingCategory.ARABIAN_HOUSE },
  { label: "Niche", value: ListingCategory.NICHE },
];

/**
 * Options for box condition
 */
export const boxConditionOptions = [
  { label: "Good", value: ListingBoxCondition.GOOD },
  { label: "Damaged", value: ListingBoxCondition.DAMAGED },
  { label: "No Box", value: ListingBoxCondition.NO_BOX },
];