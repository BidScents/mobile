import { FavoriteButton } from "@/components/listing/favorite-button";
import { ThemedIonicons } from "@/components/ui/themed-icons";
import { ImageZoom } from "@likashefqet/react-native-image-zoom";
import { Image } from "expo-image";
import React, { useState } from "react";
import { Modal, Pressable, useWindowDimensions } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import Carousel, {
  ICarouselInstance,
  Pagination,
} from "react-native-reanimated-carousel";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View } from "tamagui";
import { useThemeColors } from '../../hooks/use-theme-colors';

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
  const colors = useThemeColors();
  const ref = React.useRef<ICarouselInstance>(null);
  const progress = useSharedValue<number>(0);
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

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

  const openImage = (index: number) => {
    setSelectedIndex(index);
    setModalVisible(true);
  };

  return (
    <View>
      <Carousel
        ref={ref}
        width={width}
        height={height}
        data={imageUrls || []}
        onProgressChange={progress}
        renderItem={({ item, index }) => (
          <Pressable onPress={() => openImage(index)}>
            <Image
              source={{
                uri: `${process.env.EXPO_PUBLIC_IMAGE_BASE_URL}${item}`,
              }}
              style={{ width, height }}
            />
          </Pressable>
        )}
      />

      {/* Hide pagination when loading new data or only single image */}
      {!hidePagination && imageUrls.length > 1 && (
        <Pagination.Basic
          progress={progress}
          data={imageUrls || []}
          dotStyle={{
            backgroundColor: colors.mutedForeground,
            borderRadius: 5,
          }}
          activeDotStyle={{
            backgroundColor: colors.background,
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

      <Modal
        visible={isModalVisible}
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
        animationType="fade"
      >
        <View flex={1} backgroundColor="$background">
          <ImageZoom
            uri={`${process.env.EXPO_PUBLIC_IMAGE_BASE_URL}${imageUrls[selectedIndex]}`}
            minScale={1}
            maxScale={5}
            doubleTapScale={3}
            isSingleTapEnabled
            isDoubleTapEnabled
            style={{ width: screenWidth, height: screenHeight }}
            resizeMode="contain"
          />
          <Pressable
            onPress={() => setModalVisible(false)}
            style={{
              position: "absolute",
              top: insets.top + 10,
              right: 20,
              zIndex: 1,
              backgroundColor: "rgba(0,0,0,0.5)",
              borderRadius: 20,
              padding: 5,
            }}
          >
            <ThemedIonicons name="close" size={20} color="$foreground" />
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}
