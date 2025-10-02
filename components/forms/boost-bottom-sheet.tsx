import { StripePaymentSheet } from "@/components/payments/stripe-payment-sheet";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { useBoostListing, useListProducts } from "@/hooks/queries/use-payments";
import { formatPrice } from "@/utils/pricing";
import type { BoostRequest } from "@bid-scents/shared-sdk";
import { useAuthStore } from "@bid-scents/shared-sdk";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import * as Crypto from "expo-crypto";
import { router } from "expo-router";
import React, { forwardRef, useImperativeHandle, useMemo, useState } from "react";
import { ActivityIndicator, Alert, TouchableOpacity } from "react-native";
import { Text, XStack, YStack } from "tamagui";
import { ThemedIonicons } from "../ui/themed-icons";

export interface BoostBottomSheetMethods {
  present: () => void;
  dismiss: () => void;
}

export interface BoostBottomSheetProps {
  tabKey: string;
  selectedListings: Set<string>;
  setSelectedListings?: (listings: Set<string>) => void;
  setIsSelectMode?: (selectMode: boolean) => void;
  onSuccess?: () => void;
}

export const BoostBottomSheet = forwardRef<
  BoostBottomSheetMethods,
  BoostBottomSheetProps
>(({ tabKey, selectedListings, setSelectedListings, setIsSelectMode, onSuccess }, ref) => {
  const bottomSheetRef = React.useRef<BottomSheetModalMethods>(null);
  
  // Payment sheet state
  const [paymentSheetData, setPaymentSheetData] = useState<{
    clientSecret: string;
    amount: number;
    currency: string;
  } | null>(null);
  
  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  
  // Hooks
  const { paymentDetails } = useAuthStore();
  const { data: productsData, isLoading: productsLoading } = useListProducts();
  const boostMutation = useBoostListing();
  
  // Boost data calculation
  const boostData = useMemo(() => {
    if (!productsData || !paymentDetails) {
      return {
        normalBoost: null,
        premiumBoost: null,
        userCredits: { normal_boost: 0, premium_boost: 0 },
        selectedCount: selectedListings.size,
      };
    }
    
    const { boosts } = productsData;
    const userCredits = paymentDetails.boost_credits || {};
    const selectedCount = selectedListings.size;
    
    // Find normal (24h) and premium (48h) boosts
    const normalBoost = Object.values(boosts).find(boost => boost.duration === 24);
    const premiumBoost = Object.values(boosts).find(boost => boost.duration === 48);
    
    return {
      normalBoost,
      premiumBoost,
      userCredits: {
        normal_boost: userCredits.normal_boost || 0,
        premium_boost: userCredits.premium_boost || 0,
      },
      selectedCount,
    };
  }, [productsData, paymentDetails, selectedListings]);
  
  // Calculate pricing for current selection
  const pricingInfo = useMemo(() => {
    if (!boostData.normalBoost || !boostData.premiumBoost) {
      return { normal: null, premium: null };
    }
    
    const selectedCount = boostData.selectedCount;
    
    const calculatePrice = (boost: any) => {
      const isBulk = selectedCount >= boost.bulk_limit;
      const pricePerItem = isBulk ? boost.bulk_price : boost.normal_price;
      const totalPrice = pricePerItem * selectedCount;
      const savings = isBulk ? (boost.normal_price - boost.bulk_price) * selectedCount : 0;
      
      return {
        pricePerItem,
        totalPrice,
        isBulk,
        savings,
        bulkLimit: boost.bulk_limit,
      };
    };
    
    return {
      normal: calculatePrice(boostData.normalBoost),
      premium: calculatePrice(boostData.premiumBoost),
    };
  }, [boostData]);
  
  // Boost handlers
  const handleBoost = async (boostType: 'normal_boost' | 'premium_boost') => {
    if (selectedListings.size === 0) {
      Alert.alert('Error', 'No listings selected');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const boostRequest: BoostRequest = {
        id: Crypto.randomUUID(),
        boosts: {
          [boostType]: Array.from(selectedListings),
        },
      };
      
      const response = await boostMutation.mutateAsync(boostRequest);
      
      // Check if payment is required
      if (response.client_secret) {
        // Insufficient credits - show payment sheet
        setPaymentSheetData({
          clientSecret: response.client_secret,
          amount: response.amount,
          currency: response.currency,
        });
      } else {
        // Success - credits were used
        Alert.alert('Success', `Successfully boosted ${selectedListings.size} listing${selectedListings.size > 1 ? 's' : ''}`);
        bottomSheetRef.current?.dismiss();
        onSuccess?.();
      }
      
    } catch (error: any) {
      console.error('Boost error:', error);
      const errorMessage = error?.response?.data?.detail || error?.message || 'Failed to boost listings';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Payment handlers
  const handlePaymentSuccess = () => {
    Alert.alert('Success', 'Payment completed and listings boosted!');
    setPaymentSheetData(null);
    bottomSheetRef.current?.dismiss();
    onSuccess?.();
  };
  
  const handlePaymentError = (error: Error) => {
    setPaymentSheetData(null);
  };
  
  const handlePaymentCancel = () => {
    setPaymentSheetData(null);
  };

  useImperativeHandle(ref, () => ({
    present: () => {
      bottomSheetRef.current?.present();
    },
    dismiss: () => {
      setSelectedListings?.(new Set());
      setIsSelectMode?.(false);
      bottomSheetRef.current?.dismiss();
    },
  }));

  const renderContent = () => {
    if (productsLoading || !boostData.normalBoost || !boostData.premiumBoost) {
      return (
        <YStack gap="$4" padding="$4" paddingBottom="$5" alignItems="center" justifyContent="center" minHeight={200}>
          <ActivityIndicator size="large" />
          <Text color="$mutedForeground">Loading boost options...</Text>
        </YStack>
      );
    }

    return (
      <YStack gap="$4" padding="$4" paddingBottom="$5">
        {/* Header */}
        <YStack gap="$2">
          <XStack alignItems="center" justifyContent="space-between" gap="$2">
            <Text fontSize="$7" fontWeight="600" color="$foreground">
              {tabKey === 'featured' ? 'Extend Featured Time' : 'Boost Listings'}
            </Text>

            <TouchableOpacity onPress={() => {
              bottomSheetRef.current?.dismiss()
              router.replace(`/(tabs)/profile/seller-dashboard`)
              }} style={{ paddingHorizontal: 10 }} hitSlop={20} >
                <ThemedIonicons color="$foreground" name="close" size={24} />
            </TouchableOpacity>
          </XStack>

          <Text fontSize="$4" color="$mutedForeground" opacity={0.8}>
            {tabKey === 'featured' 
              ? 'Extend your featured time to attract more buyers' 
              : 'Boost your listings to attract more buyers'}
          </Text>
          
          {boostData.selectedCount > 0 && (
            <Text fontSize="$4" color="$foreground" fontWeight="500">
              {boostData.selectedCount} listing{boostData.selectedCount > 1 ? 's' : ''} selected
            </Text>
          )}
        </YStack>

        {/* Current Credits */}
        <YStack gap="$3">
          <Text fontSize="$5" fontWeight="500" color="$foreground">
            Your Boost Credits
          </Text>
          <YStack backgroundColor="$muted" borderRadius="$6" px="$4" py="$4" gap="$3">
            <XStack alignItems="center" justifyContent="space-between">
              <Text fontSize="$4" fontWeight="500" color="$foreground">
                Normal (24h) credits
              </Text>
              <Text fontSize="$4" color="$foreground">
                {boostData.userCredits.normal_boost}
              </Text>
            </XStack>

            <XStack alignItems="center" justifyContent="space-between">
              <Text fontSize="$4" fontWeight="500" color="$foreground">
                Premium (48h) credits
              </Text>
              <Text fontSize="$4" color="$foreground">
                {boostData.userCredits.premium_boost}
              </Text>
            </XStack>
          </YStack>
        </YStack>

        {/* Boost Options */}
        {pricingInfo.normal && pricingInfo.premium && (
          <YStack gap="$3">
            <Text fontSize="$5" fontWeight="500" color="$foreground">
              Boost Options
            </Text>
            
            {/* 24h Normal Boost */}
            <YStack backgroundColor="$muted" borderRadius="$6" p="$4" gap="$3">
              <YStack gap="$2">
                <XStack alignItems="center" justifyContent="space-between">
                  <Text fontSize="$5" fontWeight="600" color="$foreground">
                    24h Normal Boost
                  </Text>
                  <Text fontSize="$4" color="$foreground">
                    {formatPrice(pricingInfo.normal.pricePerItem)} each
                  </Text>
                </XStack>
                
                {pricingInfo.normal.isBulk && (
                  <XStack alignItems="center" justifyContent="space-between">
                    <Text fontSize="$3" color="$green10">
                      Bulk discount applied!
                    </Text>
                    <Text fontSize="$3" color="$green10">
                      Save {formatPrice(pricingInfo.normal.savings)}
                    </Text>
                  </XStack>
                )}
                
                <XStack alignItems="center" justifyContent="space-between">
                  <Text fontSize="$4" color="$mutedForeground">
                    Total: {formatPrice(pricingInfo.normal.totalPrice)}
                  </Text>
                  <Text fontSize="$4" color="$mutedForeground">
                    Need: {boostData.selectedCount} credits
                  </Text>
                </XStack>
              </YStack>
              
              <Button
                variant="outline"
                size="md"
                onPress={() => handleBoost('normal_boost')}
                disabled={isLoading || boostData.selectedCount === 0}
                borderRadius="$4"
              >
                {isLoading ? 'Processing...' : `24h Boost${boostData.userCredits.normal_boost >= boostData.selectedCount ? ' (Use Credits)' : ' (Buy Credits)'}`}
              </Button>
            </YStack>

            {/* 48h Premium Boost */}
            <YStack backgroundColor="$muted" borderRadius="$6" p="$4" gap="$3">
              <YStack gap="$2">
                <XStack alignItems="center" justifyContent="space-between">
                  <Text fontSize="$5" fontWeight="600" color="$foreground">
                    48h Premium Boost
                  </Text>
                  <Text fontSize="$4" color="$foreground">
                    {formatPrice(pricingInfo.premium.pricePerItem)} each
                  </Text>
                </XStack>
                
                {pricingInfo.premium.isBulk && (
                  <XStack alignItems="center" justifyContent="space-between">
                    <Text fontSize="$3" color="$green10">
                      Bulk discount applied!
                    </Text>
                    <Text fontSize="$3" color="$green10">
                      Save {formatPrice(pricingInfo.premium.savings)}
                    </Text>
                  </XStack>
                )}
                
                <XStack alignItems="center" justifyContent="space-between">
                  <Text fontSize="$4" color="$mutedForeground">
                    Total: {formatPrice(pricingInfo.premium.totalPrice)}
                  </Text>
                  <Text fontSize="$4" color="$mutedForeground">
                    Need: {boostData.selectedCount} credits
                  </Text>
                </XStack>
              </YStack>
              
              <Button
                variant="primary"
                size="md"
                onPress={() => handleBoost('premium_boost')}
                disabled={isLoading || boostData.selectedCount === 0}
                borderRadius="$4"
              >
                {isLoading ? 'Processing...' : `48h Boost${boostData.userCredits.premium_boost >= boostData.selectedCount ? ' (Use Credits)' : ' (Buy Credits)'}`}
              </Button>
            </YStack>
          </YStack>
        )}
      </YStack>
    );
  };

  return (
    <>
      <BottomSheet
        ref={bottomSheetRef}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        enableDynamicSizing={true}
        enablePanDownToClose={false}
        pressBehavior="none"
      >
        {renderContent()}
      </BottomSheet>
      
      {/* Payment Sheet */}
      {paymentSheetData && (
        <StripePaymentSheet
          clientSecret={paymentSheetData.clientSecret}
          amount={paymentSheetData.amount}
          currency={paymentSheetData.currency}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
          onCancel={handlePaymentCancel}
        />
      )}
    </>
  );
});

BoostBottomSheet.displayName = "BoostBottomSheet";