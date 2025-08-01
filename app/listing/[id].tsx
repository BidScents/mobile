import { Container } from "@/components/ui/container";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { Avatar, Text, useTheme, XStack, YStack } from "tamagui";
import { useListingDetail } from "../../hooks/queries/use-listing";

export default function ListingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: listing, isLoading, error } = useListingDetail(id!);
  const theme = useTheme();


  const handlePress = (link: string) => {
    router.push(link as any);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  if (isLoading) return <Text>Loading...</Text>;
  if (error) return <Text>Error loading listing</Text>;
  if (!listing) return <Text>Listing not found</Text>;
  console.log(listing);

  return (
    <Container variant="padded" safeArea={false} backgroundColor="$background">
      <Text>{listing.listing.name}</Text>

      {/* Seller Card */}
      <XStack
        alignItems="center"
        justifyContent="space-between"
        borderRadius="$6"
        py="$3"
        onPress={() => handlePress(`/profile/${listing.seller.id}`)}
      >
        <XStack alignItems="center" gap="$3">
          <Avatar circular size="$5">
            {listing.seller.profile_image_url &&
            listing.seller.profile_image_url.trim() !== "" ? (
              <Avatar.Image
                source={{
                  uri: `${process.env.EXPO_PUBLIC_IMAGE_BASE_URL}${listing.seller.profile_image_url}`,
                }}
                onError={() => console.log("Avatar image failed to load")}
              />
            ) : null}
            <Avatar.Fallback
              backgroundColor="$foreground"
              justifyContent="center"
              alignItems="center"
            >
              <Ionicons name="person" size={22} color={theme.background?.val} />
            </Avatar.Fallback>
          </Avatar>

          <YStack alignSelf="center" gap="$1">
            <Text fontSize="$5" fontWeight="500">
              @{listing.seller.username}
            </Text>
            <Text fontSize="$4" fontWeight="400">
              Checkout my store!
            </Text>
          </YStack>
        </XStack>
        
        <XStack alignItems="center" gap="$2" px="$3" py="$3" bg="$muted" borderRadius="$5">
          <Ionicons
            name="bag-outline"
            size={20}
            color={theme.foreground?.val}
          />
          <Text fontSize="$4" fontWeight="400">
            View Store
          </Text>
        </XStack>

      </XStack>

      {/* Listing Details */}

    </Container>
  );
}
