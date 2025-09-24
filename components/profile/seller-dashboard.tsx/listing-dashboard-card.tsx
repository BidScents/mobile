import { ThemedIonicons } from "@/components/ui/themed-icons";
import { useDeleteListing } from "@/hooks/queries/use-dashboard";
import { ListingPreview } from "@bid-scents/shared-sdk";
import FastImage from "@d11/react-native-fast-image";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Alert } from "react-native";
import { Spinner, Text, View, YStack } from "tamagui";

// Union type to handle both listing types
type ListingPreviewWithOptionalTimestamp = ListingPreview & {
  featured_until?: string;
};

interface ListingDashboardCardProps {
  listing: ListingPreviewWithOptionalTimestamp;
  isSelectMode?: boolean;
  isSelected?: boolean;
  onSelect?: (listing: ListingPreviewWithOptionalTimestamp) => void;
}

export function ListingDashboardCard({
  listing,
  isSelectMode = false,
  isSelected = false,
  onSelect,
}: ListingDashboardCardProps) {
  const deleteMutation = useDeleteListing();
  
  const handlePress = () => {
    if (isSelectMode) {
      // In select mode, toggle selection
      onSelect?.(listing);
    } else {
      // Normal mode, navigate to listing detail
      router.push(`/listing/${listing.id}` as any);
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

  const formatFeaturedUntil = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) {
      return "Expired";
    } else if (diffDays === 1) {
      return "Expires tomorrow";
    } else if (diffDays <= 7) {
      return `Expires in ${diffDays} days`;
    } else {
      return `Featured until ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    }
  };

  const getCardOpacity = () => {
    if (!isSelectMode) return 1;
    return isSelected ? 1 : 0.7;
  };

  const renderSelectionIcon = () => {
    if (!isSelectMode) return null;

    return (
      <View
        position="absolute"
        bottom="$2"
        right="$2"
        width={28}
        height={28}
        borderRadius={14}
        backgroundColor={isSelected ? "$blue11" : "black"}
        borderWidth={isSelected ? 0 : 2}
        borderColor="white"
        justifyContent="center"
        alignItems="center"
        zIndex={10}
      >
        {isSelected && (
          <ThemedIonicons 
            name="checkmark" 
            size={20} 
            color="white" 
          />
        )}
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
        
        {/* Selection Icon */}
        {renderSelectionIcon()}

        {/* Edit Icon */}
        {renderEditIcon()}

        {/* Delete Button */}
        {renderDeleteButton()}
        
        {/* Delete Spinner */}
        {renderDeleteSpinner()}

        <View
          position="absolute"
          bottom="$2"
          left="$2"
          gap="$2"
        >
          {listing.featured_until && (
            <Text
              borderRadius="$5"
              fontSize="$3" 
              fontWeight="400" 
              color="$mutedForeground"
              numberOfLines={1}
              backgroundColor="$muted"
              paddingHorizontal="$2"
              paddingVertical="$1.5"
            >
              {formatFeaturedUntil(listing.featured_until)}
            </Text>
          )}
          <Text
            borderRadius="$5"
            fontSize="$4" 
            fontWeight="500" 
            color="$foreground"
            numberOfLines={1}
            backgroundColor="$muted"
            paddingHorizontal="$2"
            paddingVertical="$1.5"
            marginBottom={listing.featured_until ? "$1" : 0}
          >
            {listing.name}
          </Text>
        </View>
      </View>
      
        
    </YStack>
  );
}