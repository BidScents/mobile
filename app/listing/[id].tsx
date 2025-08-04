import { FavoriteButton } from "@/components/listing/favorite-button";
import { Container } from "@/components/ui/container";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { Dimensions } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import Carousel, {
  ICarouselInstance,
  Pagination,
} from "react-native-reanimated-carousel";
import {
  Avatar,
  ScrollView,
  Text,
  useTheme,
  View,
  XStack,
  YStack,
} from "tamagui";
import { useListingDetail } from "../../hooks/queries/use-listing";

export default function ListingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: listing, isLoading, error } = useListingDetail(id!);
  const theme = useTheme();
  const ref = React.useRef<ICarouselInstance>(null);
  const progress = useSharedValue<number>(0);
  const width = Dimensions.get("window").width;
  const height = Dimensions.get("window").height * 0.6;

  const onPressPagination = (index: number) => {
    ref.current?.scrollTo({
      /**
       * Calculate the difference between the current index and the target index
       * to ensure that the carousel scrolls to the nearest index
       */
      count: index - progress.value,
      animated: true,
    });
  };

  const handlePress = (link: string) => {
    router.push(link as any);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  if (isLoading)
    return (
      <Container
        variant="padded"
        safeArea={false}
        backgroundColor="$background"
      >
        <Text>Loading...</Text>
      </Container>
    );
  if (error)
    return (
      <Container
        variant="padded"
        safeArea={false}
        backgroundColor="$background"
      >
        <Text>Error loading listing</Text>
      </Container>
    );
  if (!listing)
    return (
      <Container
        variant="padded"
        safeArea={false}
        backgroundColor="$background"
      >
        <Text>Listing not found</Text>
      </Container>
    );

  console.log(listing?.image_urls);

  return (
    <ScrollView>
      {/* Image Carousel */}
      <View>
        <Carousel
          ref={ref}
          width={width}
          height={height}
          data={listing?.image_urls || []}
          onProgressChange={progress}
          renderItem={({ index, item }) => (
            <Image
              source={{
                uri: `${process.env.EXPO_PUBLIC_IMAGE_BASE_URL}${item}`,
              }}
              style={{ width, height }}
            />
          )}
        />

        <Pagination.Basic
          progress={progress}
          data={listing?.image_urls || []}
          dotStyle={{
            backgroundColor: theme.mutedForeground.val,
            borderRadius: 5,
          }}
          activeDotStyle={{
            backgroundColor: theme.background?.val,
            overflow: "hidden",
            borderRadius: 5,
          }}
          containerStyle={{
            gap: 5,
            marginTop: 10,
            position: "absolute",
            bottom: 20,
          }}
          onPress={onPressPagination}
        />
        <View style={{ position: "absolute", bottom: 20, right: 20 }}>
          <FavoriteButton listingId={listing.listing.id} initialCount={listing.favorites_count} size="medium" />
        </View>
      </View>
      <Container
        variant="padded"
        safeArea={false}
        backgroundColor="$background"
      >
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
                <Ionicons
                  name="person"
                  size={22}
                  color={theme.background?.val}
                />
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

          <XStack
            alignItems="center"
            gap="$2"
            px="$3"
            py="$3"
            bg="$muted"
            borderRadius="$5"
          >
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
    </ScrollView>
  );
}
