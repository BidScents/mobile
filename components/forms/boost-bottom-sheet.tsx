import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { useBoostListing, useListProducts } from "@/hooks/queries/use-payments";
import { BOOST_PRODUCT_IDS, useRevenueCatBoostPurchase } from "@/hooks/queries/use-revenuecat-purchases";
import { AuthService } from "@/utils/auth-service";
import { formatPrice } from "@/utils/pricing";
import type { BoostRequest } from "@bid-scents/shared-sdk";
import { useAuthStore } from "@bid-scents/shared-sdk";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import * as Crypto from "expo-crypto";
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
  onSuccess?: () => void;
  listingId: string;
}

export const BoostBottomSheet = forwardRef<
  BoostBottomSheetMethods,
  BoostBottomSheetProps
>(({ tabKey, onSuccess, listingId }, ref) => {
  const bottomSheetRef = React.useRef<BottomSheetModalMethods>(null);
  
  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  
  // Hooks
  const { paymentDetails } = useAuthStore();
  const { data: productsData, isLoading: productsLoading } = useListProducts();
  const boostMutation = useBoostListing();
  const revenueCatBoostPurchase = useRevenueCatBoostPurchase();
  
  // Boost data calculation
  const boostData = useMemo(() => {
    if (!productsData || !paymentDetails) {
      return {
        normalBoost: null,
        premiumBoost: null,
        userCredits: { normal_boost: 0, premium_boost: 0 },
      };
    }
    
    const { boosts } = productsData;
    const userCredits = paymentDetails.boost_credits || {};
    
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
    };
  }, [productsData, paymentDetails]);
  
  // Calculate pricing for current selection
  const pricingInfo = useMemo(() => {
    if (!boostData.normalBoost || !boostData.premiumBoost) {
      return { normal: null, premium: null };
    }
    
    const calculatePrice = (boost: any, boostType: 'normal_boost' | 'premium_boost') => {
      // Calculate how many credits user has for this boost type
      const userCredits = boostType === 'normal_boost' 
        ? boostData.userCredits.normal_boost 
        : boostData.userCredits.premium_boost;
      
      // For single listing, we only need normal price and credit check
      const pricePerItem = boost.normal_price;
      const hasEnoughCredits = userCredits >= 1;
      
      return {
        pricePerItem,
        hasEnoughCredits,
      };
    };
    
    return {
      normal: calculatePrice(boostData.normalBoost, 'normal_boost'),
      premium: calculatePrice(boostData.premiumBoost, 'premium_boost'),
    };
  }, [boostData]);
  
  // Boost handlers
  const handleBoost = async (boostType: 'normal_boost' | 'premium_boost') => {
    if (!listingId) {
      Alert.alert('Error', 'No listing selected');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Check if user has enough credits
      const userCredits = boostType === 'normal_boost' 
        ? boostData.userCredits.normal_boost 
        : boostData.userCredits.premium_boost;
      
      if (userCredits >= 1) {
        // User has enough credits, use credits only
        const newRequestId = Crypto.randomUUID();
        const boostRequest: BoostRequest = {
          id: newRequestId,
          boosts: {
            [boostType]: [listingId],
          },
        };
        
        await boostMutation.mutateAsync({ boostRequest, creditsOnly: true });
        
        // Refresh auth state to update payment details
        AuthService.refreshCurrentUser();
        
        Alert.alert('Success', 'Successfully boosted listing!');
        bottomSheetRef.current?.dismiss();
        onSuccess?.();
      } else {
        // Insufficient credits, purchase via RevenueCat
        const productId = boostType === 'normal_boost' ? BOOST_PRODUCT_IDS.NORMAL_BOOST : BOOST_PRODUCT_IDS.PREMIUM_BOOST;
        
        await revenueCatBoostPurchase.mutateAsync({ 
          productIdentifier: productId, 
          listingId: listingId 
        });
        
        // After successful purchase, the listing will be boosted automatically via the RevenueCat success handler
        Alert.alert('Success', 'Purchase completed and listing boosted!');
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
  
  const cancelSheet = () => {
      bottomSheetRef.current?.dismiss()
      if(onSuccess){
        onSuccess()
      }
  };

  useImperativeHandle(ref, () => ({
    present: () => {
      bottomSheetRef.current?.present();
    },
    dismiss: () => {
      // setIsSelectMode?.(false);
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

            <TouchableOpacity onPress={cancelSheet} style={{ paddingHorizontal: 10 }} hitSlop={20} >
                <ThemedIonicons color="$foreground" name="close" size={24} />
            </TouchableOpacity>
          </XStack>

          <Text fontSize="$4" color="$mutedForeground" opacity={0.8}>
            {tabKey === 'featured' 
              ? 'Extend your featured time to attract more buyers' 
              : 'Boost your listing to attract more buyers'}
          </Text>
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
              <XStack alignItems="center" justifyContent="space-between">
                <Text fontSize="$5" fontWeight="600" color="$foreground">
                  24h Normal Boost
                </Text>
                <Text fontSize="$4" color="$foreground">
                  {formatPrice(pricingInfo.normal.pricePerItem)}
                </Text>
              </XStack>
              
              <Button
                variant="outline"
                size="md"
                onPress={() => handleBoost('normal_boost')}
                disabled={isLoading}
                borderRadius="$4"
              >
                {isLoading ? 'Processing...' : `${pricingInfo.normal.hasEnoughCredits ? 'Use Credit' : 'Buy Credit'}`}
              </Button>
            </YStack>

            {/* 48h Premium Boost */}
            <YStack backgroundColor="$muted" borderRadius="$6" p="$4" gap="$3">
              <XStack alignItems="center" justifyContent="space-between">
                <Text fontSize="$5" fontWeight="600" color="$foreground">
                  48h Premium Boost
                </Text>
                <Text fontSize="$4" color="$foreground">
                  {formatPrice(pricingInfo.premium.pricePerItem)}
                </Text>
              </XStack>
              
              <Button
                variant="primary"
                size="md"
                onPress={() => handleBoost('premium_boost')}
                disabled={isLoading}
                borderRadius="$4"
              >
                {isLoading ? 'Processing...' : `${pricingInfo.premium.hasEnoughCredits ? 'Use Credit' : 'Buy Credit'}`}
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

    </>
  );
});

BoostBottomSheet.displayName = "BoostBottomSheet";