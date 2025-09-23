import { ThemedIonicons } from "@/components/ui/themed-icons";
import { ListingPreview } from "@bid-scents/shared-sdk";
import FastImage from "@d11/react-native-fast-image";
import { router } from "expo-router";
import { Text, View, YStack } from "tamagui";

interface ListingDashboardCardProps {
  listing: ListingPreview;
  isSelectMode?: boolean;
  isSelected?: boolean;
  onSelect?: (listing: ListingPreview) => void;
}

export function ListingDashboardCard({
  listing,
  isSelectMode = false,
  isSelected = false,
  onSelect,
}: ListingDashboardCardProps) {
  
  const handlePress = () => {
    if (isSelectMode) {
      // In select mode, toggle selection
      onSelect?.(listing);
    } else {
      // Normal mode, navigate to listing detail
      router.push(`/listing/${listing.id}` as any);
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
        top="$2"
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
        width={28}
        height={28}
        borderRadius={14}
        backgroundColor={"$background"}
        justifyContent="center"
        alignItems="center"
        zIndex={10}
        onPress={() => router.push(`/listing/${listing.id}/edit` as any)}
      >
        <ThemedIonicons 
          name="pencil" 
          size={20} 
          color="$foreground" 
        />
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

        <Text
          position="absolute"
          bottom="$2"
          left="$2"
          borderRadius="$5"
          fontSize="$4" 
          fontWeight="500" 
          color="$foreground"
          numberOfLines={1}
          backgroundColor="$muted"
          paddingHorizontal="$2"
          paddingVertical="$1.5"
        >
          {listing.name}
        </Text>
      </View>
      
        
    </YStack>
  );
}