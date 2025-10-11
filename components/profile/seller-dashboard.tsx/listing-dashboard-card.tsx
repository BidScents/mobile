import { SettlementBottomSheet, SettlementBottomSheetMethods } from "@/components/forms/settlement-bottom-sheet";
import { ThemedIonicons } from "@/components/ui/themed-icons";
import { useDeleteListing } from "@/hooks/queries/use-dashboard";
import { calculateTimeLeft, formatTimeLeft } from "@/utils/countdown";
import { ListingCard, ListingType } from "@bid-scents/shared-sdk";
import FastImage from "@d11/react-native-fast-image";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import { Spinner, Text, View, YStack } from "tamagui";


interface ListingDashboardCardProps {
  listing: ListingCard;
  isSelectMode?: boolean;
  onBoost?: (listing: ListingCard) => void;
  isSettlementMode?: boolean;
  featured_until?: string;
}

export function ListingDashboardCard({
  listing,
  isSelectMode = false,
  onBoost,
  isSettlementMode = false,
  featured_until,
}: ListingDashboardCardProps) {
  const deleteMutation = useDeleteListing();
  const isSwap = listing.listing_type === ListingType.SWAP;
  const settlementBottomSheetRef = useRef<SettlementBottomSheetMethods>(null);
  
  // State for live countdown
  const [countdownText, setCountdownText] = useState<string>("");

  const handleSettlementPress = () => {
    settlementBottomSheetRef.current?.present();
  };
  
  const handlePress = () => {
    if (isSettlementMode) {
      // In settlement mode, open settlement bottom sheet
      handleSettlementPress();
    } else {
      // Normal mode, navigate to listing detail
      router.push(`/listing/${listing.id}` as any);
    }
  };

  const handleBoostPress = () => {
    if (isSwap) {
      Alert.alert("Swap Listings", "Can't boost swap listings.");
    } else {
      onBoost?.(listing);
    }
  };

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Delete Listing",
      `Are you sure you want to delete "${listing.name}"? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteMutation.mutate(listing.id);
          },
        },
      ]
    );
  };

  // Live countdown effect
  useEffect(() => {
    if (!featured_until) return;

    const updateCountdown = () => {
      const timeLeft = calculateTimeLeft(featured_until);
      if (timeLeft) {
        setCountdownText(formatTimeLeft(timeLeft));
      } else {
        setCountdownText("Expired");
      }
    };

    // Update immediately
    updateCountdown();

    // Set up interval to update every second
    const interval = setInterval(updateCountdown, 1000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [featured_until]);

  const getCardOpacity = () => {
    return 1;
  };

  const renderBoostButton = () => {
    if (!isSelectMode || isSwap) return null;

    return (
      <View
        position="absolute"
        bottom="$2"
        right="$2"
        backgroundColor="$blue11"
        borderRadius="$4"
        paddingHorizontal="$2"
        paddingVertical="$1.5"
        justifyContent="center"
        alignItems="center"
        zIndex={10}
        onPress={handleBoostPress}
        pressStyle={{ scale: 0.95 }}
        hitSlop={8}
      >
        <Text color="white" fontSize="$3" fontWeight="600">
          Boost
        </Text>
      </View>
    );
  };

  const renderEditIcon = () => {
    if (!isSelectMode) return null;

    return (
      <View
        position="absolute"
        top="$2"
        left="$2"
        width={24}
        height={24}
        borderRadius={12}
        backgroundColor={"$background"}
        justifyContent="center"
        alignItems="center"
        zIndex={10}
        hitSlop={16}
        onPress={() => router.push(`/listing/${listing.id}/edit` as any)}
      >
        <ThemedIonicons 
          name="pencil" 
          size={18} 
          color="$foreground" 
        />
      </View>
    );
  };

  const renderDeleteButton = () => {
    if (!isSelectMode) return null;

    return (
      <View
        position="absolute"
        top="$2"
        right="$2"
        width={24}
        height={24}
        borderRadius={12}
        backgroundColor="$red9"
        justifyContent="center"
        alignItems="center"
        zIndex={10}
        hitSlop={16}
        onPress={handleDelete}
        pressStyle={{ scale: 0.95 }}
      >
        <ThemedIonicons 
          name="close" 
          size={16} 
          color="white" 
        />
      </View>
    );
  };

  const renderDeleteSpinner = () => {
    if (!deleteMutation.isPending) return null;

    return (
      <View
        position="absolute"
        top="0"
        right="0"
        bottom="0"
        left="0"
        justifyContent="center"
        alignItems="center"
        zIndex={10}
      >
        <Spinner size="large" color="black" />
      </View>
    );
  };

  return (
    <YStack 
      onPress={handlePress}
      backgroundColor="$background"
      borderRadius="$6"
      pressStyle={{ scale: 0.98 }}
      gap="$2"
    >
      <View position="relative">
        <FastImage
          source={{
            uri: `${process.env.EXPO_PUBLIC_IMAGE_BASE_URL}${listing.image_url}`,
          }}
          style={{
            width: "100%",
            aspectRatio: 1,
            borderRadius: 10,
            backgroundColor: "$gray2",
            opacity: getCardOpacity(),
          }}
        />
        
        {/* Boost Button */}
        {renderBoostButton()}

        {/* Edit Icon */}
        {renderEditIcon()}

        {/* Delete Button */}
        {renderDeleteButton()}
        
        {/* Delete Spinner */}
        {renderDeleteSpinner()}

        <View
          position="absolute"
          top="$2"
          left="$2"
          gap="$2"
        >
          {featured_until && countdownText && (
            <Text
              borderRadius="$5"
              fontSize="$3" 
              fontWeight="400" 
              color="$foreground"
              numberOfLines={1}
              backgroundColor="$muted"
              paddingHorizontal="$2"
              paddingVertical="$1.5"
            >
              {countdownText}
            </Text>
          )}
        </View>
        <View
          position="absolute"
          bottom="$2"
          left="$2"
          gap="$2"
        >
          <Text
            borderRadius="$5"
            fontSize="$4" 
            fontWeight="500" 
            color="$foreground"
            numberOfLines={1}
            backgroundColor="$muted"
            paddingHorizontal="$2"
            paddingVertical="$1.5"
            marginBottom={featured_until ? "$1" : 0}
          >
            {listing.name}
          </Text>
        </View>
      </View>

      {isSettlementMode && (
        <SettlementBottomSheet ref={settlementBottomSheetRef} id={listing.id} />
      )}
        
    </YStack>
  );
}