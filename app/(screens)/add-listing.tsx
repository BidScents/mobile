import { ControlledInput } from "@/components/forms/controlled-input";
import { ControlledMultipleImagePicker } from "@/components/forms/controlled-multiple-image-picker";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { KeyboardAwareView } from "@/components/ui/keyboard-aware-view";
import { useCreateListing } from "@/hooks/mutations/use-create-listing";
import { boxConditionOptions, categoryOptions, listingTypeOptions } from "@/types/create-listing-types";
import { uploadListingImages } from "@/utils/upload-listing-images";
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
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Alert, ScrollView } from "react-native";
import { Text, XStack, YStack } from "tamagui";


/**
 * Default form values for creating a listing
 */
const DEFAULT_VALUES: CreateListingFormData = {
  type: ListingType.FIXED_PRICE,
  name: '',
  brand: '',
  description: '',
  category: ListingCategory.DESIGNER,
  volume: 50,
  remaining_percentage: 100,
  quantity: 1,
  purchase_year: new Date().getFullYear(),
  box_condition: ListingBoxCondition.GOOD,
  image_urls: [], // Start empty, will be populated after upload
  is_extendable: false,
}

export default function AddListingScreen() {
  const [imageUris, setImageUris] = useState<string[]>([]);
  const { showLoading, hideLoading } = useLoadingStore();
  const { user } = useAuthStore();

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

  const createListingMutation = useCreateListing({
    onSuccess: (data) => {
      hideLoading();
      router.replace(`/listing/${data.listing.id}`);
    },
    onError: (error) => {
      console.error("Failed to create listing:", error);
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

    try {
      showLoading();
      
      // Step 1: Upload images
      console.log("Uploading images...");
      const uploadedImageUrls = await uploadListingImages(
        imageUris, 
        user.id,
        (uploaded, total) => {
          console.log(`Uploaded ${uploaded}/${total} images`);
          // You could update loading text here if needed
        }
      );

      // Step 2: Update form data with uploaded URLs
      const updatedData = {
        ...data,
        image_urls: uploadedImageUrls
      };

      // Step 3: Transform for API
      const listingData: CreateListingRequest = {
        ...updatedData,
        // For auctions, set price = starting_price
        price: data.type === ListingType.AUCTION 
          ? data.starting_price! 
          : data.price!,
        // Provide defaults for optional backend fields
        batch_code: data.batch_code || undefined,
        starting_price: data.starting_price || undefined,
        reserve_price: data.reserve_price || undefined,
        buy_now_price: data.buy_now_price || undefined,
        bid_increment: data.bid_increment || undefined,
        ends_at: data.ends_at || undefined,
        is_extendable: data.is_extendable || false,
      };

      console.log("Creating listing...");
      await createListingMutation.mutateAsync(listingData);

    } catch (error: any) {
      hideLoading();
      
      if (error.message === 'USER_CANCELLED') {
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

  return (
    <Container backgroundColor="$background" safeArea={false} variant="padded">
      <KeyboardAwareView backgroundColor="$background">
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <YStack flex={1} gap="$5" minHeight="100%">
            {/* Images Section */}
            <YStack gap="$3">
              <ControlledMultipleImagePicker
                imageUris={imageUris}
                onImagesChange={setImageUris}
                disabled={loading}
                maxImages={10}
                required
                label="Photos"
              />
            </YStack>

            {/* Basic Information */}
            <YStack gap="$3">
              <ControlledInput
                control={control}
                name="type"
                variant="select"
                label="Listing Type"
                placeholder="Select listing type"
                disabled={loading}
                options={listingTypeOptions}
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

{!isAuction ? (
                <ControlledInput
                  control={control}
                  name="price"
                  variant="numeric"
                  label="Price"
                  placeholder="0.00"
                  disabled={loading}
                />
              ) : (
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
                    name="reserve_price"
                    variant="numeric"
                    label="Reserve Price (Optional)"
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
                    switchChecked={watch('is_extendable')}
                    disabled={loading}
                  />
                </YStack>
              )}

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

            </YStack>

            {/* Debug: Show validation errors */}
            {Object.keys(errors).length > 0 && (
              <YStack
                gap="$2"
                padding="$3"
                backgroundColor="$red2"
                borderRadius="$4"
              >
                <Text color="$red10" fontSize="$3" fontWeight="500">
                  Please fix the following errors:
                </Text>
                {Object.entries(errors).map(([key, error]) => (
                  <Text key={key} color="$red10" fontSize="$2">
                    • {key}: {error?.message}
                  </Text>
                ))}
              </YStack>
            )}

            <Button
              variant="primary"
              size="lg"
              fullWidth
              onPress={handleSubmit(onSubmit)}
              disabled={loading || !isValid || imageUris.length === 0}
              borderRadius="$10"
            >
              {loading ? "Creating Listing..." : "Create Listing"}
            </Button>
          </YStack>
        </ScrollView>
      </KeyboardAwareView>
    </Container>
  );
}