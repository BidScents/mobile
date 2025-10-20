import { BoostBottomSheet, BoostBottomSheetMethods } from "@/components/forms/boost-bottom-sheet";
import { ControlledInput } from "@/components/forms/controlled-input";
import {
  ConnectOnboardingBottomSheet,
  ConnectOnboardingBottomSheetMethods,
} from "@/components/payments/connect-onboarding-bottom-sheet";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import Input from "@/components/ui/input";
import { MultipleImagePicker } from "@/components/ui/multiple-image-picker";
import { ThemedIonicons } from "@/components/ui/themed-icons";
import { useCreateListing } from "@/hooks/queries/use-dashboard";
import {
  boxConditionOptions,
  categoryOptions,
  listingTypeOptions,
} from "@/types/create-listing-types";
import {
  ImageUploadConfigs,
  uploadMultipleImages,
} from "@/utils/image-upload-service";
import {
  CreateListingRequest,
  createListingSchema,
  ListingBoxCondition,
  ListingCategory,
  ListingType,
  useAuthStore,
  useLoadingStore,
  type CreateListingFormData,
} from "@bid-scents/shared-sdk";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Alert } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Text, XStack, YStack } from "tamagui";

/**
 * Default form values for creating a listing
 */
const DEFAULT_VALUES: CreateListingFormData = {
  type: ListingType.FIXED_PRICE,
  name: "",
  brand: "",
  description: "",
  category: ListingCategory.DESIGNER,
  volume: 50,
  remaining_percentage: 100,
  price: 10,
  quantity: 1,
  purchase_year: new Date().getFullYear(),
  box_condition: ListingBoxCondition.GOOD,
  image_urls: [], // Start empty, will be populated after upload
  is_extendable: false,
};

export default function AddListingScreen() {
  const [imageUris, setImageUris] = useState<string[]>([]);
  const { showLoading, hideLoading } = useLoadingStore();
  const [boostSwitch, setBoostSwitch] = useState(false);
  const [listingId, setListingId] = useState<string | null>(null);
  const { user, paymentDetails } = useAuthStore();
  const connectOnboardingBottomSheetRef =
    useRef<ConnectOnboardingBottomSheetMethods>(null);
  const boostBottomSheetRef = useRef<BoostBottomSheetMethods>(null);

  const {
    control,
    handleSubmit,
    watch,
    formState: { isValid, errors },
  } = useForm<CreateListingFormData>({
    resolver: zodResolver(createListingSchema),
    mode: "onChange",
    defaultValues: DEFAULT_VALUES,
  });

  const listingType = watch("type");
  const isAuction = listingType === ListingType.AUCTION;
  const isSwap = listingType === ListingType.SWAP;

  // Check if user has swap access
  const isSwapActive = Boolean(
    paymentDetails?.eligible_for_swap_until &&
      new Date(paymentDetails.eligible_for_swap_until) > new Date()
  );

  // Filter listing type options based on swap access
  const availableListingTypeOptions = isSwapActive
    ? listingTypeOptions
    : listingTypeOptions.filter((option) => option.value !== ListingType.SWAP);

  const createListingMutation = useCreateListing({
    onSuccess: (data) => {
      if (boostSwitch && data.listing.listing_type !== ListingType.SWAP) {
        setListingId(data.listing.id);
        hideLoading();

      } else {
        hideLoading();
        router.replace(`/listing/${data.listing.id}`);
      }
    },
    onError: (error: any) => {
      console.error("Failed to create listing:", error?.body?.detail);
      hideLoading();
      Alert.alert("Error", "Failed to create listing. Please try again.");
    },
  });

  /**
   * Handle form submission with image upload
   */
  const onSubmit = async (data: CreateListingFormData) => {
    if (!user?.id) {
      Alert.alert("Error", "You must be logged in to create a listing");
      return;
    }

    if (imageUris.length === 0) {
      Alert.alert("Error", "Please add at least one image");
      return;
    }

    // Reset listing ID for new submission
    setListingId(null);

    try {
      showLoading();

      // Step 1: Upload images
      console.log("Uploading images...");
      const uploadResults = await uploadMultipleImages(
        imageUris,
        ImageUploadConfigs.listing(),
        (progress) => {
          console.log(`Uploaded ${progress.uploaded}/${progress.total} images`);
          // You could update loading text here if needed
        }
      );

      // Extract URLs from upload results
      const uploadedImageUrls = uploadResults.map(
        (result) => `listing-images/${result.path}`
      );

      // Step 2: Update form data with uploaded URLs
      const updatedData = {
        ...data,
        image_urls: uploadedImageUrls,
      };

      // Step 3: Transform for API
      const listingData: CreateListingRequest = {
        ...updatedData,
        // For auctions, set price = starting_price
        price:
          data.type === ListingType.AUCTION
            ? data.starting_price!
            : data.type === ListingType.SWAP
            ? 10
            : data.price!,
        // Provide defaults for optional backend fields
        batch_code: data.batch_code || undefined,
        starting_price: data.starting_price || undefined,
        buy_now_price: data.buy_now_price || undefined,
        bid_increment: data.bid_increment || undefined,
        ends_at: data.ends_at || undefined,
        is_extendable: data.is_extendable || false,
      };

      console.log("Creating listing...");
      await createListingMutation.mutateAsync(listingData);
    } catch (error: any) {
      hideLoading();

      if (error.message === "USER_CANCELLED") {
        // User cancelled during image upload
        setImageUris([]); // Clear images as requested
        Alert.alert("Cancelled", "Listing creation was cancelled");
      } else {
        console.error("Submission error:", error);
        Alert.alert("Error", "Failed to create listing. Please try again.");
      }
    }
  };

  const loading = createListingMutation.isPending;

  // Check if user needs to set up connect account
  useEffect(() => {
    if (!paymentDetails || !paymentDetails.has_connect_account) {
      setTimeout(() => {
        connectOnboardingBottomSheetRef.current?.present();
      }, 500);
    }
  }, [user, paymentDetails]);

  // Present boost bottom sheet when listing is created and boost is enabled
  useEffect(() => {
    if (listingId && boostSwitch) {
      boostBottomSheetRef.current?.present();
    }
  }, [listingId, boostSwitch]);

  const handleOnboardingComplete = () => {
    console.log("Onboarding completed successfully!");
  };

  const handleOnboardingDoLater = () => {
    console.log("User chose to set up payments later");
  };

  return (
    <Container backgroundColor="$background" safeArea={false} variant="padded">
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <YStack flex={1} gap="$5" pb="$4">
          {/* Images Section */}
          <YStack gap="$3">
            <MultipleImagePicker
              imageUris={imageUris}
              onImagesChange={setImageUris}
              disabled={loading}
              maxImages={10}
              label="Photos"
            />
          </YStack>

          {/* Basic Information */}
          <YStack gap="$3">
            {/* Swap Access Disclaimer */}
            {!isSwapActive && (
              <XStack
                backgroundColor="$blue2"
                borderRadius="$6"
                padding="$3"
                borderWidth={1}
                borderColor="$blue6"
                onPress={() => router.push("/(screens)/subscription-paywall")}
                alignItems="center"
                gap="$2"
              >
                <ThemedIonicons
                  name="information-circle-outline"
                  size={20}
                  color="$blue11"
                />
                <Text
                  fontSize="$3"
                  color="$blue11"
                  textAlign="center"
                  fontWeight="500"
                >
                  Subscribe to get Swap access and boost credits
                </Text>
              </XStack>
            )}

            <ControlledInput
              control={control}
              name="type"
              variant="select"
              label="Listing Type"
              placeholder="Select listing type"
              disabled={loading}
              options={availableListingTypeOptions}
            />

            <ControlledInput
              control={control}
              name="name"
              variant="text"
              label="Title"
              placeholder="Enter listing title"
              disabled={loading}
            />

            <ControlledInput
              control={control}
              name="description"
              variant="multiline"
              label="Description"
              placeholder="Describe your fragrance..."
              disabled={loading}
              numberOfLines={4}
            />

            <ControlledInput
              control={control}
              name="brand"
              variant="text"
              label="Brand"
              placeholder="Enter brand name"
              disabled={loading}
            />

            <ControlledInput
              control={control}
              variant="select"
              name="category"
              label="Category"
              placeholder="Select category"
              disabled={loading}
              options={categoryOptions}
            />

            {!isSwap && !isAuction && (
              <ControlledInput
                control={control}
                name="price"
                variant="numeric"
                label="Price"
                placeholder="0.00"
                disabled={loading}
              />
            )}

            {isAuction && (
              <YStack gap="$4">
                <ControlledInput
                  control={control}
                  name="starting_price"
                  variant="numeric"
                  label="Starting Price"
                  placeholder="0.00"
                  disabled={loading}
                />

                <ControlledInput
                  control={control}
                  name="buy_now_price"
                  variant="numeric"
                  label="Buy Now Price (Optional)"
                  placeholder="0.00"
                  disabled={loading}
                />

                <ControlledInput
                  control={control}
                  name="bid_increment"
                  variant="numeric"
                  label="Bid Increment"
                  placeholder="5.00"
                  disabled={loading}
                />

                <ControlledInput
                  control={control}
                  name="ends_at"
                  variant="date"
                  label="End Date & Time"
                  placeholder="Select auction end time"
                  disabled={loading}
                />

                <ControlledInput
                  control={control}
                  name="is_extendable"
                  variant="switch"
                  label="Extendable (Optional)"
                  placeholder="Extendable"
                  switchChecked={watch("is_extendable")}
                  disabled={loading}
                />
              </YStack>
            )}

            <XStack gap="$3">
              <YStack flex={1}>
                <ControlledInput
                  control={control}
                  name="volume"
                  variant="numeric"
                  label="Volume (ml)"
                  placeholder="100"
                  disabled={loading}
                />
              </YStack>

              <YStack flex={1}>
                <ControlledInput
                  control={control}
                  name="remaining_percentage"
                  variant="numeric"
                  label="Remaining %"
                  placeholder="100"
                  disabled={loading}
                />
              </YStack>
            </XStack>

            <ControlledInput
              control={control}
              name="box_condition"
              variant="select"
              label="Box Condition"
              placeholder="Select condition"
              disabled={loading}
              options={boxConditionOptions}
            />

            <XStack gap="$3">
              <YStack flex={1}>
                <ControlledInput
                  control={control}
                  name="quantity"
                  variant="numeric"
                  label="Quantity"
                  placeholder="1"
                  disabled={loading}
                />
              </YStack>

              <YStack flex={1}>
                <ControlledInput
                  control={control}
                  name="purchase_year"
                  variant="numeric"
                  label="Purchase Year"
                  placeholder={new Date().getFullYear().toString()}
                  disabled={loading}
                />
              </YStack>
            </XStack>

            <ControlledInput
              control={control}
              name="batch_code"
              variant="text"
              label="Batch Code (Optional)"
              placeholder="Enter batch code if available"
              disabled={loading}
            />

            {listingType !== ListingType.SWAP &&
            <Input
              variant="switch"
              label="Boost Listing"
              placeholder="Boost"
              disabled={loading}
              onSwitchChange={(checked) => setBoostSwitch(checked)} value={""} 
              onChangeText={() => {}}
              />
            }
          </YStack>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            onPress={handleSubmit(onSubmit)}
            disabled={loading || !isValid}
            borderRadius="$10"
          >
            {loading ? "Creating Listing..." : "Create Listing"}
          </Button>
        </YStack>
      </KeyboardAwareScrollView>

      <ConnectOnboardingBottomSheet
        ref={connectOnboardingBottomSheetRef}
        onComplete={handleOnboardingComplete}
        onDoLater={handleOnboardingDoLater}
      />
      {listingId && (
        <BoostBottomSheet ref={boostBottomSheetRef} tabKey="add-listing" listingId={listingId} onSuccess={() => router.replace(`/listing/${listingId}`)} />
      )}
    </Container>
  );
}
