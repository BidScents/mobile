import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { ThemedIonicons } from "@/components/ui/themed-icons";
import { currency } from "@/constants/constants";
import { useCreateTransaction } from "@/hooks/queries/use-payments";
import { useProfileListings } from "@/hooks/queries/use-profile";
import { useThemeColors } from "@/hooks/use-theme-colors";
import {
  ListingCard,
  ProfileTab,
  TransactionRequest,
  useAuthStore,
} from "@bid-scents/shared-sdk";
import FastImage from "@d11/react-native-fast-image";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { FlashList } from "@shopify/flash-list";
import * as Haptics from "expo-haptics";
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { Controller, useForm } from "react-hook-form";
import { ActivityIndicator, Alert, StyleSheet, TouchableOpacity } from "react-native";
import {
  Text,
  View,
  XStack,
  YStack
} from "tamagui";
import { z } from "zod";

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

    try {
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
    } catch (error) {
      console.error("Failed to create transaction:", error);
      Alert.alert(
        "Transaction Failed",
        "Failed to create transaction. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  const handleLoadMore = useCallback(() => {
    console.log("Loading more listings...");
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderListingItem = ({ item: listing }: { item: ListingCard }) => {
    return (
        <XStack
          alignItems="center"
          gap="$3"
          borderRadius="$4"
          backgroundColor="$muted"
          padding="$3"
          marginVertical="$1"
          pressStyle={{ opacity: 0.7, scale: 0.98 }}
          onPress={() => handleListingSelect(listing)}
        >
          {listing.image_url && (
            <FastImage
              source={{ uri: `${process.env.EXPO_PUBLIC_IMAGE_BASE_URL}${listing.image_url}` }}
              style={{
                width: 60,
                height: 60,
                borderRadius: 10,
              }}
            />
          )}
          <YStack flex={1} gap="$1">
            <Text fontSize="$4" fontWeight="600" color="$foreground">
              {listing.name}
            </Text>
            <Text fontSize="$5" fontWeight="600" color="$foreground">
              {currency} {listing.price.toFixed(2)}
            </Text>
          </YStack>
          <ThemedIonicons
            name="chevron-forward"
            size={20}
            color="mutedForeground"
          />
        </XStack>
    );
  };

  const renderListingSelection = () => (
    <YStack gap="$4" padding="$4" flex={1}>
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
          <View alignItems="center" justifyContent="center" flex={1}>
            <ThemedIonicons
              name="storefront-outline"
              size={48}
              color="mutedForeground"
            />
            <Text color="$mutedForeground" marginTop="$2" textAlign="center">
              No active listings found
            </Text>
          </View>
        ) : (
          <FlashList
            data={allListings}
            renderItem={renderListingItem}
            estimatedItemSize={80}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.1}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={
              isFetchingNextPage ? (
                <View padding="$3" alignItems="center">
                  <ActivityIndicator size="small" />
                </View>
              ) : null
            }
          />
        )}
      </YStack>

      <Button
        onPress={() => bottomSheetRef.current?.dismiss()}
        variant="secondary"
        size="lg"
        borderRadius="$10"
      >
        Cancel
      </Button>
    </YStack>
  );

  const renderTransactionForm = () => (
    <YStack gap="$4" padding="$4">
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
        <XStack
          alignItems="center"
          gap="$3"
          borderRadius="$4"
          backgroundColor="$muted"
          padding="$3"
        >
          {selectedListing.image_url && (
            <FastImage
              source={{ uri: `${process.env.EXPO_PUBLIC_IMAGE_BASE_URL}${selectedListing.image_url}` }}
              style={{
                width: 50,
                height: 50,
                borderRadius: 10,
              }}
            />
          )}
          <YStack flex={1}>
            <Text fontSize="$4" fontWeight="600" color="$foreground">
              {selectedListing.name}
            </Text>
            <Text fontSize="$3" color="$mutedForeground">
              Original: {currency} {selectedListing.price.toFixed(2)}
            </Text>
          </YStack>
        </XStack>
      )}

      {/* Price Input */}
      <YStack gap="$2">
        <Text fontSize="$4" fontWeight="500" color="$foreground">
          Unit Price
        </Text>
        <Controller
          control={control}
          name="unit_price"
          render={({ field: { onChange, value } }) => (
            <BottomSheetTextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: colors.muted,
                  color: colors.foreground,
                },
              ]}
              placeholder="0.00"
              placeholderTextColor={colors.placeholder}
              value={value?.toString() || ""}
              onChangeText={(text) => {
                const numValue = parseFloat(text) || 0;
                onChange(numValue);
              }}
              keyboardType="decimal-pad"
            />
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
            <BottomSheetTextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: colors.muted,
                  color: colors.foreground,
                },
              ]}
              placeholder="1"
              placeholderTextColor={colors.placeholder}
              value={value?.toString() || ""}
              onChangeText={(text) => {
                const numValue = parseInt(text) || 1;
                onChange(numValue);
              }}
              keyboardType="number-pad"
            />
          )}
        />
        {errors.quantity && (
          <Text color="$red10" fontSize="$3">
            {errors.quantity.message}
          </Text>
        )}
      </YStack>

      {/* Total Preview */}
      <View
        backgroundColor="$muted"
        borderRadius="$6"
        padding="$3"
      >
        <XStack justifyContent="space-between" alignItems="center">
          <Text fontSize="$5" fontWeight="500" color="$foreground">
            Total Amount
          </Text>
          <Text fontSize="$6" fontWeight="600" color="$foreground">
            {currency + " " + ((watchedValues.unit_price || 0) * (watchedValues.quantity || 1)).toFixed(2)}
          </Text>
        </XStack>
      </View>

      {/* Action Buttons */}
      <Button
        onPress={handleSubmit(onSubmitTransaction)}
        variant="primary"
        size="lg"
        borderRadius="$10"
        disabled={createTransactionMutation.isPending}
      >
        {createTransactionMutation.isPending ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          "Create Transaction"
        )}
      </Button>
    </YStack>
  );

  return (
    <BottomSheet 
      ref={bottomSheetRef} 
      snapPoints={currentView === "listing-selection" ? ["65%"] : ["60%"]}
      enableDynamicSizing={true}
      keyboardBehavior="interactive"
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