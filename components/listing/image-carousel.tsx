import { FavoriteButton } from "@/components/listing/favorite-button";
import { Image } from "expo-image";
import React from "react";
import { useSharedValue } from "react-native-reanimated";
import Carousel, {
  ICarouselInstance,
  Pagination,
} from "react-native-reanimated-carousel";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme, View } from "tamagui";

export function ImageCarousel({
  imageUrls,
  width,
  height,
  listingId,
  favoritesCount,
  hidePagination = false,
}: {
  imageUrls: string[];
  width: number;
  height: number;
  listingId: string;
  favoritesCount: number;
  hidePagination?: boolean;
}) {
  const theme = useTheme();
  const ref = React.useRef<ICarouselInstance>(null);
  const progress = useSharedValue<number>(0);
  const insets = useSafeAreaInsets();

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

  return (
    <View>
      <Carousel
        ref={ref}
        width={width}
        height={height}
        data={imageUrls || []}
        onProgressChange={progress}
        renderItem={({ item }) => (
          <Image
            source={{
              uri: `${process.env.EXPO_PUBLIC_IMAGE_BASE_URL}${item}`,
            }}
            style={{ width, height }}
          />
        )}
      />

      {/* Hide pagination when loading new data or only single image */}
      {!hidePagination && imageUrls.length > 1 && (
        <Pagination.Basic
          progress={progress}
          data={imageUrls || []}
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
      )}
      <View style={{ position: "absolute", bottom: 20, right: 20 }}>
        <FavoriteButton
          listingId={listingId}
          initialCount={favoritesCount}
          size="medium"
        />
      </View>

    </View>
  );
}
