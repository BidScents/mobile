import { ControlledInput } from "@/components/forms/controlled-input";
import { EditableImageCarousel, type EditableImageItem } from "@/components/listing/editable-image-carousel";
import { EditListingSkeleton } from "@/components/suspense/edit-listing-skeleton";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ThemedIonicons } from "@/components/ui/themed-icons";
import { useUpdateListing } from "@/hooks/queries/use-dashboard";
import { useListingDetail } from "@/hooks/queries/use-listing";
import { useThemeColors } from "@/hooks/use-theme-colors";
import {
  boxConditionOptions,
  categoryOptions,
  listingTypeOptions,
} from "@/types/create-listing-types";
import { ImageUploadConfigs, uploadMultipleImages } from "@/utils/image-upload-service";
import {
  createListingSchema,
  ListingType,
  useAuthStore,
  useLoadingStore,
  type CreateListingFormData,
  type UpdateListingRequest,
} from "@bid-scents/shared-sdk";
import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Alert, Dimensions } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Text, XStack, YStack } from "tamagui";

export default function ListingEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: listing, isLoading, error, isRefetching } = useListingDetail(id!);
  const updateListingMutation = useUpdateListing();
  const { user } = useAuthStore();
  const { showLoading, hideLoading } = useLoadingStore();
  const colors = useThemeColors();

  const [images, setImages] = useState<EditableImageItem[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const { control, handleSubmit, watch, reset, formState } = useForm<CreateListingFormData>({
    resolver: zodResolver(createListingSchema),
    mode: "onChange",
  });

  const listingType = watch("type");
  const isAuction = listingType === ListingType.AUCTION;
  const isSwap = listingType === ListingType.SWAP;

  // Initialize form with listing data
  useEffect(() => {
    if (listing?.listing) {
      const listingData = listing.listing;
      const formData: CreateListingFormData = {
        type: listingData.listing_type,
        name: listingData.name,
        brand: listingData.brand,
        description: listingData.description,
        category: listingData.category,
        volume: listingData.volume,
        remaining_percentage: listingData.remaining_percentage,
        quantity: listingData.quantity,
        purchase_year: listingData.purchase_year,
        box_condition: listingData.box_condition,
        image_urls: listing.image_urls || [], // Initialize with actual URLs
        price: listingData.price,
        starting_price: listing.auction_details?.starting_price,
        bid_increment: listing.auction_details?.bid_increment,
        ends_at: listing.auction_details?.ends_at ? new Date(listing.auction_details.ends_at).toISOString() : undefined,
        batch_code: listingData.batch_code || undefined,
        buy_now_price: listing.auction_details?.buy_now_price || undefined,
        is_extendable: listing.auction_details?.is_extendable || false,
      };
      
      reset(formData);
      
      // Initialize images
      const existingImages: EditableImageItem[] = (listing.image_urls || []).map(url => ({
        uri: url,
        isNew: false,
        originalUrl: url,
      }));
      setImages(existingImages);
    }
  }, [listing, reset]);

  // Better change detection using React Hook Form's formState
  const { isDirty, dirtyFields } = formState;
  
  
  // Check if images have changed
  const originalImageUrls = listing?.image_urls || [];
  const currentImageUrls = images.filter(img => !img.isNew).map(img => img.originalUrl || img.uri);
  const hasNewImages = images.some(img => img.isNew);
  const imagesReordered = JSON.stringify(originalImageUrls) !== JSON.stringify(currentImageUrls);
  const isImagesChanged = hasNewImages || imagesReordered || originalImageUrls.length !== currentImageUrls.length;

  // Check if any form field or images have changed
  const isAnyChange = isDirty || isImagesChanged;

  // Helper function to get changed fields only
  const getChangedFields = () => {
    const updateRequest: UpdateListingRequest = {};
    
    // Only include fields that are actually dirty
    if (dirtyFields.name) updateRequest.name = watch("name");
    if (dirtyFields.brand) updateRequest.brand = watch("brand");
    if (dirtyFields.description) updateRequest.description = watch("description");
    if (dirtyFields.category) updateRequest.category = watch("category");
    if (dirtyFields.volume) updateRequest.volume = watch("volume");
    if (dirtyFields.remaining_percentage) updateRequest.remaining_percentage = watch("remaining_percentage");
    if (dirtyFields.quantity) updateRequest.quantity = watch("quantity");
    if (dirtyFields.purchase_year) updateRequest.purchase_year = watch("purchase_year");
    if (dirtyFields.box_condition) updateRequest.box_condition = watch("box_condition");
    if (dirtyFields.price) updateRequest.price = watch("price");
    if (dirtyFields.starting_price) updateRequest.starting_price = watch("starting_price");
    if (dirtyFields.bid_increment) updateRequest.bid_increment = watch("bid_increment");
    if (dirtyFields.ends_at) updateRequest.ends_at = watch("ends_at");
    if (dirtyFields.is_extendable) updateRequest.is_extendable = watch("is_extendable");
    if (dirtyFields.batch_code) updateRequest.batch_code = watch("batch_code");
    if (dirtyFields.buy_now_price) updateRequest.buy_now_price = watch("buy_now_price");
    if (dirtyFields.type) updateRequest.listing_type = watch("type");
    
    // Note: image_urls will be handled separately in onSubmit using finalImageUrls
    
    return updateRequest;
  };

  // Handle form submission
  const onSubmit = async (data: CreateListingFormData) => {
    
    if (!user?.id || !listing) {
      Alert.alert("Error", "Unable to update listing");
      return;
    }

    // Check if we have at least one image (like add-listing does)
    if (images.length === 0) {
      Alert.alert("Error", "Please add at least one image");
      return;
    }

    try {
      setSubmitting(true);
      showLoading();

      // Step 1: Upload new images if any
      let finalImageUrls = [...currentImageUrls];
      const newImages = images.filter(img => img.isNew);
      
      if (newImages.length > 0) {
        const uploadResults = await uploadMultipleImages(
          newImages.map(img => img.uri),
          ImageUploadConfigs.listing()
        );

        // Add new uploaded URLs to the final array
        const newUploadedUrls = uploadResults.map(result => `listing-images/${result.path}`);
        
        // Reconstruct the final array maintaining the order from images state
        finalImageUrls = [];
        for (const image of images) {
          if (image.isNew) {
            const uploadIndex = newImages.findIndex(newImg => newImg.uri === image.uri);
            if (uploadIndex >= 0) {
              finalImageUrls.push(newUploadedUrls[uploadIndex]);
            }
          } else {
            finalImageUrls.push(image.originalUrl || image.uri);
          }
        }
      } else {
        // Just reorder existing images
        finalImageUrls = images.map(img => img.originalUrl || img.uri);
      }

      // Step 2: Prepare update request with only changed fields
      const updateRequest = getChangedFields();
      
      // Include images in update request only if they have changed
      if (isImagesChanged) {
        updateRequest.image_urls = finalImageUrls;
      }

      await updateListingMutation.mutateAsync({
        listingId: id!,
        request: updateRequest,
      });

      hideLoading();
      router.replace(`/listing/${id}`);
    } catch (error: any) {
      hideLoading();
      setSubmitting(false);

      if (error.message === "USER_CANCELLED") {
        Alert.alert("Cancelled", "Listing update was cancelled");
      } else {
        Alert.alert("Error", "Failed to update listing. Please try again.");
      }
    }
  };
  
  if (isLoading || !listing || isRefetching) {
    return (
      <EditListingSkeleton width={Dimensions.get("window").width} />
    );
  }

  if (error) {
    return (
      <Container backgroundColor="$background" safeArea={false} variant="padded">
        <YStack flex={1} justifyContent="center" alignItems="center">
          <Text>Error loading listing</Text>
          <Button onPress={() => router.back()} variant="secondary" mt="$4">
            Go Back
          </Button>
        </YStack>
      </Container>
    );
  }

  return (
    <>
    <KeyboardAwareScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      bottomOffset={10}
    >
    <Container safeArea={false} variant="padded">
        <YStack
          flex={1}
          gap="$5"
          pb="$4"
        >
            {/* Images Section */}
            <YStack gap="$3">
              <EditableImageCarousel
                images={images}
                onImagesChange={setImages}
                width={350}
                height={250}
                disabled={submitting}
                maxImages={10}
              />
            </YStack>

            {/* Form Fields Section */}
            <YStack gap="$3" flex={1}>
              {/* Listing Type */}
              <ControlledInput
                control={control}
                name="type"
                variant="select"
                label="Listing Type"
                placeholder="Select listing type"
                disabled={listing.listing.listing_type === ListingType.AUCTION || listing.listing.listing_type === ListingType.SWAP}
                options={listingTypeOptions.filter(option => option.value !== ListingType.AUCTION && option.value !== ListingType.SWAP)}
              />
              {listing.listing.listing_type === ListingType.AUCTION || listing.listing.listing_type === ListingType.SWAP ?
              <XStack
                backgroundColor="$blue2"
                borderRadius="$6"
                padding="$3"
                borderWidth={1}
                borderColor="$blue6"
                alignItems="center"
                gap="$2"
              >
                <ThemedIonicons name="information-circle-outline" size={20} color="$blue11" />
                <Text
                  fontSize="$3"
                  color="$blue11"
                  textAlign="center"
                  fontWeight="500"
                >
                  Listing type cannot be changed.
                </Text>
              </XStack>
              : null}

              {/* Basic Information */}
              <ControlledInput
                control={control}
                name="name"
                variant="text"
                label="Title"
                placeholder="Enter listing title"
                disabled={submitting}
              />

              <ControlledInput
                control={control}
                name="description"
                variant="multiline"
                label="Description"
                placeholder="Describe your fragrance..."
                disabled={submitting}
                numberOfLines={4}
              />

              <ControlledInput
                control={control}
                name="brand"
                variant="text"
                label="Brand"
                placeholder="Enter brand name"
                disabled={submitting}
              />

              <ControlledInput
                control={control}
                variant="select"
                name="category"
                label="Category"
                placeholder="Select category"
                disabled={submitting}
                options={categoryOptions}
              />

              {/* Price Fields */}
              {!isSwap && !isAuction && (
                <ControlledInput
                  control={control}
                  name="price"
                  variant="numeric"
                  label="Price"
                  placeholder="0.00"
                  disabled={submitting}
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
                    disabled={submitting}
                  />

                  <ControlledInput
                    control={control}
                    name="buy_now_price"
                    variant="numeric"
                    label="Buy Now Price (Optional)"
                    placeholder="0.00"
                    disabled={submitting}
                  />

                  <ControlledInput
                    control={control}
                    name="bid_increment"
                    variant="numeric"
                    label="Bid Increment"
                    placeholder="5.00"
                    disabled={submitting}
                  />

                  <ControlledInput
                    control={control}
                    name="ends_at"
                    variant="date"
                    label="End Date & Time"
                    placeholder="Select auction end time"
                    disabled={submitting}
                  />
                </YStack>
              )}

              {/* Physical Details */}
              <XStack gap="$3">
                <YStack flex={1}>
                  <ControlledInput
                    control={control}
                    name="volume"
                    variant="numeric"
                    label="Volume (ml)"
                    placeholder="100"
                    disabled={submitting}
                  />
                </YStack>

                <YStack flex={1}>
                  <ControlledInput
                    control={control}
                    name="remaining_percentage"
                    variant="numeric"
                    label="Remaining %"
                    placeholder="100"
                    disabled={submitting}
                  />
                </YStack>
              </XStack>

              <ControlledInput
                control={control}
                name="box_condition"
                variant="select"
                label="Box Condition"
                placeholder="Select condition"
                disabled={submitting}
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
                    disabled={submitting}
                  />
                </YStack>

                <YStack flex={1}>
                  <ControlledInput
                    control={control}
                    name="purchase_year"
                    variant="numeric"
                    label="Purchase Year"
                    placeholder={new Date().getFullYear().toString()}
                    disabled={submitting}
                  />
                </YStack>
              </XStack>

              <ControlledInput
                control={control}
                name="batch_code"
                variant="text"
                label="Batch Code (Optional)"
                placeholder="Enter batch code if available"
                disabled={submitting}
              />

          </YStack>
        </YStack>
    </Container>
    </KeyboardAwareScrollView>
      {/* Submit Button - Only shown when editing is enabled */}
      {isAnyChange && (
      <YStack position="absolute" bottom={10} left={0} right={0} padding="$4">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onPress={handleSubmit(onSubmit)}
          disabled={submitting || !isAnyChange}
          borderRadius="$6"
        >
          {submitting ? "Updating Listing..." : "Update Listing"}
        </Button>
      </YStack>
      )}
    </>
  );
}
