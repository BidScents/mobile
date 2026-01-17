import { ThemedIonicons } from "@/components/ui/themed-icons";
import FastImage from '@d11/react-native-fast-image';
import { ImageZoom } from "@likashefqet/react-native-image-zoom";
import React, { useState } from 'react';
import { Modal, Pressable, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View } from "tamagui";
import { useThemeColors } from '../../hooks/use-theme-colors';

interface ProfilePictureProps {
  profilePicture?: string | null;
}

export const ProfilePicture: React.FC<ProfilePictureProps> = ({
  profilePicture,
}) => {
  const colors = useThemeColors();
  const hasValidUrl = profilePicture && profilePicture.trim() !== "";
  const [isModalVisible, setModalVisible] = useState(false);
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const handlePress = () => {
    if (hasValidUrl) {
      setModalVisible(true);
    }
  };

  return (
    <>
      <Pressable onPress={handlePress}>
        <FastImage
          source={hasValidUrl ? {
            uri: `${process.env.EXPO_PUBLIC_IMAGE_BASE_URL}${profilePicture}`,
          } : require('@/assets/images/image-placeholder.png')}
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            borderWidth: 4,
            borderColor: colors.foreground,
          }}
          resizeMode={FastImage.resizeMode.cover}
        />
      </Pressable>
      
      {hasValidUrl && (
        <Modal
          visible={isModalVisible}
          backdropColor={colors.background}
          onRequestClose={() => setModalVisible(false)}
          animationType="fade"
        >
          <Pressable 
            style={{ flex: 1, backgroundColor: "$background" }}
            onPress={() => setModalVisible(false)}
          >
             <ImageZoom
              uri={`${process.env.EXPO_PUBLIC_IMAGE_BASE_URL}${profilePicture}`}
              minScale={1}
              maxScale={5}
              doubleTapScale={3}
              isSingleTapEnabled
              isDoubleTapEnabled
              style={{ width: screenWidth, height: screenHeight }}
              resizeMode="contain"
            />
            <View
              onPress={() => setModalVisible(false)}
              backgroundColor="$background"
              style={{
                position: "absolute",
                top: insets.top + 10,
                right: 20,
                zIndex: 1,
                borderRadius: 20,
                padding: 5,
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <ThemedIonicons name="close" size={24} color="$foreground" />
            </View>
          </Pressable>
        </Modal>
      )}
    </>
  );
};
