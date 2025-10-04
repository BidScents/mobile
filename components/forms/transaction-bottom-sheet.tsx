import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { ThemedIonicons } from "@/components/ui/themed-icons";
import { currency } from "@/constants/constants";
import { useCreateTransaction } from "@/hooks/queries/use-payments";
import { useProfileListings } from "@/hooks/queries/use-profile";
import { useThemeColors } from "@/hooks/use-theme-colors";
import {
  ListingCard,
  ListingType,
  ProfileTab,
  TransactionRequest,
  useAuthStore,
} from "@bid-scents/shared-sdk";
import FastImage from "@d11/react-native-fast-image";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { LegendList } from "@legendapp/list";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { Controller, useForm } from "react-hook-form";
import { ActivityIndicator, Keyboard, StyleSheet, TouchableOpacity, TouchableWithoutFeedback } from "react-native";
import {
  Card,
  Text,
  View,
  XStack,
  YStack
} from "tamagui";
import { z } from "zod";

const GAP_SIZE = 12; // Same as active-view.tsx

// Transaction form validation schema
const transactionFormSchema = z.object({
  listing_id: z.string().min(1, "Please select a listing"),
  unit_price: z
    .number()
    .min(0.01, "Price must be greater than $0.01")
    .max(999999, "Price cannot exceed $999,999"),
  quantity: z
    .number()
    .int("Quantity must be a whole number")
    .min(1, "Quantity must be at least 1")
    .max(999, "Quantity cannot exceed 999"),
});

type TransactionFormData = z.infer<typeof transactionFormSchema>;

// Transaction bottom sheet view states
type TransactionBottomSheetView = "listing-selection" | "transaction-form";

// Props for the transaction bottom sheet
interface TransactionBottomSheetProps {
  conversationId: string;
  buyerId: string;
  onTransactionCreated?: () => void;
}

export interface TransactionBottomSheetMethods {
  present: () => void;
  dismiss: () => void;
  presentWithListing: (listing: any) => void;
}

export const TransactionBottomSheet = forwardRef<
  TransactionBottomSheetMethods,
  TransactionBottomSheetProps
>(({ conversationId, buyerId, onTransactionCreated }, ref) => {
  const [currentView, setCurrentView] = useState<TransactionBottomSheetView>("listing-selection");
  const [selectedListing, setSelectedListing] = useState<ListingCard | null>(null);

  const bottomSheetRef = React.useRef<BottomSheetModalMethods>(null);
  const { user } = useAuthStore();
  const colors = useThemeColors();
  const createTransactionMutation = useCreateTransaction();

  // Get user's listings for selection
  const {
    data: listingsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingListings,
  } = useProfileListings(user?.id || "", ProfileTab.ACTIVE, {
    per_page: 20,
  });

  //TODO: FIX RERENDERS WHEN NEW LISTINGS ADDED(CAUSED MY MEMO)
  // Get all user's active listings
  const allListings = useMemo(() => {
    return listingsData?.pages.flatMap(page => page.listings) || [];
  }, [listingsData]);

  const formatVolume = (volume: number, percentage: number): string => {
    return `${percentage}% full • ${volume}ml`;
  };

  // Form setup
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      listing_id: "",
      unit_price: 0,
      quantity: 1,
    },
  });

  const watchedValues = watch();

  useImperativeHandle(ref, () => ({
    present: () => {
      setCurrentView("listing-selection");
      setSelectedListing(null);
      bottomSheetRef.current?.present();
    },
    dismiss: () => bottomSheetRef.current?.dismiss(),
    presentWithListing: (listing: any) => {
      setSelectedListing(listing);
      setValue("listing_id", listing.id);
      setValue("unit_price", listing.price);
      setCurrentView("transaction-form");
      bottomSheetRef.current?.present();
    },
  }));

  const handleListingSelect = (listing: ListingCard) => {
    setSelectedListing(listing);
    setValue("listing_id", listing.id);
    setValue("unit_price", listing.price);
    setCurrentView("transaction-form");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleBackToListings = () => {
    setCurrentView("listing-selection");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const onSubmitTransaction = async (data: TransactionFormData) => {
    if (!selectedListing) return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const transactionRequest: TransactionRequest = {
        listing_id: data.listing_id,
        conversation_id: conversationId,
        buyer_id: buyerId,
        unit_price: data.unit_price * 100, // Convert to cents
        quantity: data.quantity,
      };

      await createTransactionMutation.mutateAsync(transactionRequest);
      
      bottomSheetRef.current?.dismiss();
      onTransactionCreated?.();
  };

  const handleLoadMore = useCallback(() => {
    console.log("Loading more listings...");
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const getListingTypeBadge = (listingType: ListingType) => {
    switch (listingType) {
      case ListingType.FIXED_PRICE:
        return "Fixed Price";
      case ListingType.NEGOTIABLE:
        return "Negotiable";
      case ListingType.AUCTION:
        return "Auction";
      case ListingType.SWAP:
        return "Swap";
      default:
        return "Buy Now";
    }
  };

  const renderHeader = (listing: ListingCard) => {
    const badge = getListingTypeBadge(listing.listing_type);
    return (
      <XStack
        position="absolute"
        top="$2"
        left="$2"
        backgroundColor="$muted"
        alignItems="center"
        borderRadius="$4"
        paddingHorizontal="$2"
        paddingVertical="$1"
      >
        <Text fontSize="$1" fontWeight="500" color="$foreground">
          {badge}
        </Text>
      </XStack>
    );
  };

  const formatPrice = (price: number): string => {
    return `${currency} ${price.toFixed(0)}`;
  };

  const renderListingItem = ({ item: listing, index }: { item: ListingCard; index: number }) => {
    const isLeftColumn = index % 2 === 0;
    
    return (
      <View
        style={{
          paddingLeft: isLeftColumn ? 0 : GAP_SIZE / 2,
          paddingRight: isLeftColumn ? GAP_SIZE / 2 : 0,
          paddingBottom: GAP_SIZE,
        }}
      >
        <Card
          size="$3"
          backgroundColor="$background"
          borderRadius="$5"
          pressStyle={{ opacity: 0.95, scale: 0.98 }}
          onPress={() => handleListingSelect(listing)}
          flex={1}
        >
          <YStack gap="$2" padding="$2">
            {/* Product Image */}
            <YStack position="relative">
              {listing.image_url && process.env.EXPO_PUBLIC_IMAGE_BASE_URL ? (
                <FastImage
                  source={{
                    uri: `${process.env.EXPO_PUBLIC_IMAGE_BASE_URL}${listing.image_url}`,
                  }}
                  style={{
                    width: "100%",
                    aspectRatio: 1,
                    borderRadius: 8,
                  }}
                />
              ) : (
                <YStack
                  width="100%"
                  aspectRatio={1}
                  borderRadius="$4"
                  backgroundColor="$gray2"
                  justifyContent="center"
                  alignItems="center"
                >
                  <Text color="$mutedForeground" fontSize="$2">No Image</Text>
                </YStack>
              )}
              {renderHeader(listing)}
            </YStack>

            {/* Product Info */}
            <YStack gap="$1" flex={1}>
              <Text
                fontSize="$3"
                fontWeight="500"
                numberOfLines={1}
                color="$foreground"
              >
                {listing.name}
              </Text>

              <Text fontSize="$2" color="$mutedForeground" numberOfLines={1}>
                {formatVolume(listing.volume, listing.remaining_percentage)}
              </Text>

              <Text fontSize="$3" fontWeight="600" color="$foreground">
                {formatPrice(listing.price)}
              </Text>
            </YStack>
          </YStack>
        </Card>
      </View>
    );
  };

  const renderListingSelection = () => (
    <YStack gap="$4" padding="$4" paddingBottom="$5" flex={1}>
      {/* Header */}
      <YStack gap="$2">
        <Text fontSize="$7" fontWeight="600" color="$foreground">
          Select Listing
        </Text>
        <Text color="$mutedForeground" fontSize="$4">
          Choose a listing to create a transaction for
        </Text>
      </YStack>

      {/* Listings List */}
      <YStack flex={1}>
        {isLoadingListings ? (
          <View alignItems="center" justifyContent="center" flex={1}>
            <ActivityIndicator size="large" />
            <Text color="$mutedForeground" marginTop="$2">
              Loading your listings...
            </Text>
          </View>
        ) : allListings.length === 0 ? (
           <View flex={1} justifyContent="center" alignItems="center" paddingHorizontal="$6" marginVertical="$6">
              <ThemedIonicons 
                name="storefront-outline" 
                size={64} 
                color={colors.mutedForeground} 
                style={{ marginBottom: 16 }} 
              />
              <Text fontSize="$6" fontWeight="600" color="$foreground" textAlign="center" marginBottom="$2">
                No Active Listings
              </Text>
              <Text fontSize="$4" color="$mutedForeground" textAlign="center" marginBottom="$4">
                You don&apos;t have any active listings yet. Create your first listing to start selling.
              </Text>
              <Button variant="primary" onPress={() => router.push('/(screens)/add-listing')}>
                Create Listing
              </Button>
            </View>
        ) : (
          <LegendList
            data={allListings}
            renderItem={renderListingItem}
            estimatedItemSize={220}
            numColumns={2}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.3}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            recycleItems
            drawDistance={500}
            ListFooterComponent={
              isFetchingNextPage ? (
                <View paddingVertical="$4" flexDirection="row" style={{ gap: GAP_SIZE }}>
                  <View style={{ flex: 1, height: 200, backgroundColor: "$muted", borderRadius: 8 }} />
                  <View style={{ flex: 1, height: 200, backgroundColor: "$muted", borderRadius: 8 }} />
                </View>
              ) : null
            }
          />
        )}
      </YStack>

      <YStack gap="$3" marginTop="$2">
        <Button
          onPress={() => bottomSheetRef.current?.dismiss()}
          variant="secondary"
          size="lg"
          borderRadius="$5"
        >
          Cancel
        </Button>
      </YStack>
    </YStack>
  );

  const renderTransactionForm = () => (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <YStack gap="$4" padding="$4" paddingBottom="$5">
      {/* Header with back button */}
      <XStack alignItems="center" gap="$3">
        <TouchableOpacity onPress={handleBackToListings}>
          <ThemedIonicons name="arrow-back" size={24} />
        </TouchableOpacity>
        <YStack flex={1}>
          <Text fontSize="$7" fontWeight="600" color="$foreground">
            Transaction Details
          </Text>
          <Text color="$mutedForeground" fontSize="$4">
            Set price and quantity for {selectedListing?.name}
          </Text>
        </YStack>
      </XStack>

      {/* Selected Listing Preview */}
      {selectedListing && (
        <YStack gap="$3">
          <XStack alignItems="center" justifyContent="space-between">
            <Text fontSize="$5" fontWeight="600" color="$foreground">
              Selected Listing
            </Text>
            <View
              backgroundColor="$muted"
              borderRadius="$5"
              paddingHorizontal="$2"
              paddingVertical="$1.5"
            >
              <Text fontSize="$2" fontWeight="500" color="$foreground">
                {getListingTypeBadge(selectedListing.listing_type)}
              </Text>
            </View>
          </XStack>
          
          <XStack padding="$4" backgroundColor="$muted" borderRadius="$6" alignItems="center" gap="$3">
            {selectedListing.image_url ? (
              <FastImage
                source={{ uri: `${process.env.EXPO_PUBLIC_IMAGE_BASE_URL}${selectedListing.image_url}` }}
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 12,
                }}
              />
            ) : (
              <YStack
                width={60}
                height={60}
                borderRadius="$4"
                backgroundColor="$gray2"
                justifyContent="center"
                alignItems="center"
              >
                <Text color="$mutedForeground" fontSize="$2">No Image</Text>
              </YStack>
            )}
            <YStack flex={1} gap="$1">
              <Text fontSize="$4" fontWeight="600" color="$foreground" numberOfLines={1}>
                {selectedListing.name}
              </Text>
              <Text fontSize="$3" color="$mutedForeground">
                {formatVolume(selectedListing.volume, selectedListing.remaining_percentage)}
              </Text>
              <Text fontSize="$3" color="$mutedForeground">
                Original: {currency} {selectedListing.price.toFixed(2)}
              </Text>
            </YStack>
          </XStack>
        </YStack>
      )}

      {/* Form Inputs */}
      <YStack gap="$4">
        {/* Price Input */}
        <YStack gap="$2">
          <Text fontSize="$4" fontWeight="500" color="$foreground">
            Unit Price
          </Text>
          <Controller
            control={control}
            name="unit_price"
            render={({ field: { onChange, value } }) => (
              <View
                borderRadius="$4"
                backgroundColor="$muted"
                borderWidth={1}
                borderColor={errors.unit_price ? "$red8" : "transparent"}
              >
                <BottomSheetTextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: "transparent",
                      color: colors.foreground,
                    },
                  ]}
                  placeholder="0.00"
                  placeholderTextColor={colors.placeholder}
                  value={value?.toString() || ""}
                  onChangeText={(text) => {
                    if (text === "") {
                      // Allow empty field temporarily
                      onChange("");
                    } else {
                      const numValue = parseFloat(text);
                      if (!isNaN(numValue)) {
                        onChange(numValue);
                      }
                    }
                  }}
                  onBlur={() => {
                    // Set minimum value on blur if empty
                    if (!value || value < 0.01) {
                      onChange(0.01);
                    }
                  }}
                  keyboardType="decimal-pad"
                />
              </View>
            )}
          />
          {errors.unit_price && (
            <Text color="$red10" fontSize="$3">
              {errors.unit_price.message}
            </Text>
          )}
        </YStack>

        {/* Quantity Input */}
        <YStack gap="$2">
          <Text fontSize="$4" fontWeight="500" color="$foreground">
            Quantity
          </Text>
          <Controller
            control={control}
            name="quantity"
            render={({ field: { onChange, value } }) => (
              <View
                borderRadius="$4"
                backgroundColor="$muted"
                borderWidth={1}
                borderColor={errors.quantity ? "$red8" : "transparent"}
              >
                <BottomSheetTextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: "transparent",
                      color: colors.foreground,
                    },
                  ]}
                  placeholder="1"
                  placeholderTextColor={colors.placeholder}
                  value={value?.toString() || ""}
                  onChangeText={(text) => {
                    if (text === "") {
                      // Allow empty field temporarily
                      onChange("");
                    } else {
                      const numValue = parseInt(text);
                      if (!isNaN(numValue)) {
                        onChange(numValue);
                      }
                    }
                  }}
                  onBlur={() => {
                    // Set minimum value on blur if empty
                    if (!value || value < 1) {
                      onChange(1);
                    }
                  }}
                  keyboardType="number-pad"
                />
              </View>
            )}
          />
          {errors.quantity && (
            <Text color="$red10" fontSize="$3">
              {errors.quantity.message}
            </Text>
          )}
        </YStack>
      </YStack>

      {/* Total Preview */}
      <YStack gap="$3">
        <Text fontSize="$6" fontWeight="600" color="$foreground">
          Transaction Summary
        </Text>
        <YStack gap="$2" padding="$3" backgroundColor="$muted" borderRadius="$5">
          <XStack justifyContent="space-between" alignItems="center">
            <Text fontSize="$4" color="$mutedForeground">
              Unit Price
            </Text>
            <Text fontSize="$4" fontWeight="500" color="$foreground">
              {currency} {(watchedValues.unit_price || 0).toFixed(2)}
            </Text>
          </XStack>
          
          <XStack justifyContent="space-between" alignItems="center">
            <Text fontSize="$4" color="$mutedForeground">
              Quantity
            </Text>
            <Text fontSize="$4" fontWeight="500" color="$foreground">
              {watchedValues.quantity || 1}
            </Text>
          </XStack>
          
          <XStack justifyContent="space-between" alignItems="center" marginVertical="$1">
            <Text fontSize="$5" fontWeight="600" color="$foreground">
              Total Amount
            </Text>
            <Text fontSize="$5" fontWeight="600" color="$green11">
              {currency} {((watchedValues.unit_price || 0) * (watchedValues.quantity || 1)).toFixed(2)}
            </Text>
          </XStack>
        </YStack>
      </YStack>

      {/* Action Buttons */}
      <YStack gap="$3" marginTop="$2">
        <Button
          onPress={handleSubmit(onSubmitTransaction)}
          variant="primary"
          size="lg"
          borderRadius="$5"
          disabled={createTransactionMutation.isPending}
        >
          Create Transaction
        </Button>
      </YStack>
      </YStack>
    </TouchableWithoutFeedback>
  );

  return (
    <BottomSheet 
      ref={bottomSheetRef} 
      enableDynamicSizing={true}
      keyboardBlurBehavior="restore"
    >
      {currentView === "listing-selection" 
        ? renderListingSelection() 
        : renderTransactionForm()
      }
    </BottomSheet>
  );
});

TransactionBottomSheet.displayName = "TransactionBottomSheet";

const styles = StyleSheet.create({
  textInput: {
    fontSize: 16,
    lineHeight: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    minHeight: 48,
  },
});