import { Container } from "@/components/ui/container";
import React from "react";
import ContentLoader, { Circle, Rect } from "react-content-loader/native";
import { Dimensions } from "react-native";
import { ScrollView, YStack } from "tamagui";
import { useThemeColors } from "@/hooks/use-theme-colors";

export function PaymentsLoadingState() {
  const colors = useThemeColors();
  const screenWidth = Dimensions.get('window').width;
  const contentWidth = screenWidth - 32;

  const backgroundColor = colors.muted || '#e8e8e8';
  const foregroundColor = '#d0d0d0';

  return (
    <Container variant="padded" safeArea={false}>
      <ScrollView flex={1}>
        <YStack gap="$6" pt="$2">
          <ContentLoader
            speed={2}
            width={contentWidth}
            height={400}
            viewBox={`0 0 ${contentWidth} 400`}
            backgroundColor={backgroundColor}
            foregroundColor={foregroundColor}
          >
            {/* Payment Method Section */}
            <Rect x="0" y="0" rx="4" ry="4" width="140" height="18" />
            <Rect x="0" y="30" rx="12" ry="12" width={contentWidth} height="80" />

            {/* Active Subscription Section */}
            <Rect x="0" y="140" rx="4" ry="4" width="160" height="18" />
            <Rect x="0" y="170" rx="12" ry="12" width={contentWidth} height="80" />

            {/* Your Benefits Section */}
            <Rect x="0" y="280" rx="4" ry="4" width="120" height="18" />
            <Rect x="0" y="310" rx="12" ry="12" width={contentWidth} height="60" />
          </ContentLoader>
        </YStack>
      </ScrollView>
    </Container>
  );
}