import { Container } from '@/components/ui/container'
import React from 'react'
import ContentLoader, { Circle, Rect } from 'react-content-loader/native'
import { Dimensions } from 'react-native'
import { View, YStack, XStack } from 'tamagui'
import { useThemeColors } from '../../hooks/use-theme-colors'

interface EditListingSkeletonProps {
  width?: number
}

export function EditListingSkeleton({ width = Dimensions.get('window').width }: EditListingSkeletonProps) {
  const colors = useThemeColors()
  
  // Use theme colors for skeleton loading
  const backgroundColor = colors.muted || '#e8e8e8'
  const foregroundColor = '#d0d0d0'

  return (
    <Container
      variant="padded"
      safeArea={false}
      backgroundColor="$background"
    >
      <YStack flex={1} gap="$4" paddingTop="$6">
        {/* Header with Back Button and Title */}
        <XStack alignItems="center" gap="$4" paddingBottom="$2">
          <ContentLoader
            speed={2}
            width={24}
            height={24}
            viewBox="0 0 24 24"
            backgroundColor={backgroundColor}
            foregroundColor={foregroundColor}
          >
            <Rect x="0" y="8" rx="2" ry="2" width="24" height="8" />
          </ContentLoader>
          
          <ContentLoader
            speed={2}
            width={120}
            height={32}
            viewBox="0 0 120 32"
            backgroundColor={backgroundColor}
            foregroundColor={foregroundColor}
          >
            <Rect x="0" y="8" rx="4" ry="4" width="120" height="16" />
          </ContentLoader>
        </XStack>

        {/* Image Carousel - Larger Size */}
        <View height={320} width={width - 32}>
          <ContentLoader
            speed={2}
            width={width - 32}
            height={320}
            viewBox={`0 0 ${width - 32} 320`}
            backgroundColor={backgroundColor}
            foregroundColor={foregroundColor}
          >
            {/* Main Image Rectangle */}
            <Rect x="0" y="0" rx="12" ry="12" width={width - 32} height="280" />
            
            {/* Page indicators */}
            <Circle cx={(width - 32) / 2 - 10} cy="300" r="4" />
            <Circle cx={(width - 32) / 2 + 10} cy="300" r="4" />
          </ContentLoader>
        </View>

        {/* Form Fields */}
        <YStack gap="$4" flex={1}>
          {/* Listing Type Field (Disabled) */}
          <YStack gap="$2">
            <ContentLoader
              speed={2}
              width={width - 32}
              height={20}
              viewBox={`0 0 ${width - 32} 20`}
              backgroundColor={backgroundColor}
              foregroundColor={foregroundColor}
            >
              <Rect x="0" y="6" rx="3" ry="3" width="80" height="8" />
            </ContentLoader>
            <ContentLoader
              speed={2}
              width={width - 32}
              height={44}
              viewBox={`0 0 ${width - 32} 44`}
              backgroundColor={backgroundColor}
              foregroundColor={foregroundColor}
            >
              <Rect x="0" y="0" rx="8" ry="8" width={width - 32} height="44" />
            </ContentLoader>
          </YStack>

          {/* Title Field */}
          <YStack gap="$2">
            <ContentLoader
              speed={2}
              width={width - 32}
              height={20}
              viewBox={`0 0 ${width - 32} 20`}
              backgroundColor={backgroundColor}
              foregroundColor={foregroundColor}
            >
              <Rect x="0" y="6" rx="3" ry="3" width="40" height="8" />
            </ContentLoader>
            <ContentLoader
              speed={2}
              width={width - 32}
              height={44}
              viewBox={`0 0 ${width - 32} 44`}
              backgroundColor={backgroundColor}
              foregroundColor={foregroundColor}
            >
              <Rect x="0" y="0" rx="8" ry="8" width={width - 32} height="44" />
            </ContentLoader>
          </YStack>

          {/* Description Field (Multiline) */}
          <YStack gap="$2">
            <ContentLoader
              speed={2}
              width={width - 32}
              height={20}
              viewBox={`0 0 ${width - 32} 20`}
              backgroundColor={backgroundColor}
              foregroundColor={foregroundColor}
            >
              <Rect x="0" y="6" rx="3" ry="3" width="70" height="8" />
            </ContentLoader>
            <ContentLoader
              speed={2}
              width={width - 32}
              height={88}
              viewBox={`0 0 ${width - 32} 88`}
              backgroundColor={backgroundColor}
              foregroundColor={foregroundColor}
            >
              <Rect x="0" y="0" rx="8" ry="8" width={width - 32} height="88" />
            </ContentLoader>
          </YStack>

          {/* Brand Field */}
          <YStack gap="$2">
            <ContentLoader
              speed={2}
              width={width - 32}
              height={20}
              viewBox={`0 0 ${width - 32} 20`}
              backgroundColor={backgroundColor}
              foregroundColor={foregroundColor}
            >
              <Rect x="0" y="6" rx="3" ry="3" width="50" height="8" />
            </ContentLoader>
            <ContentLoader
              speed={2}
              width={width - 32}
              height={44}
              viewBox={`0 0 ${width - 32} 44`}
              backgroundColor={backgroundColor}
              foregroundColor={foregroundColor}
            >
              <Rect x="0" y="0" rx="8" ry="8" width={width - 32} height="44" />
            </ContentLoader>
          </YStack>

          {/* Category Field */}
          <YStack gap="$2">
            <ContentLoader
              speed={2}
              width={width - 32}
              height={20}
              viewBox={`0 0 ${width - 32} 20`}
              backgroundColor={backgroundColor}
              foregroundColor={foregroundColor}
            >
              <Rect x="0" y="6" rx="3" ry="3" width="60" height="8" />
            </ContentLoader>
            <ContentLoader
              speed={2}
              width={width - 32}
              height={44}
              viewBox={`0 0 ${width - 32} 44`}
              backgroundColor={backgroundColor}
              foregroundColor={foregroundColor}
            >
              <Rect x="0" y="0" rx="8" ry="8" width={width - 32} height="44" />
            </ContentLoader>
          </YStack>

          {/* Price Field */}
          <YStack gap="$2">
            <ContentLoader
              speed={2}
              width={width - 32}
              height={20}
              viewBox={`0 0 ${width - 32} 20`}
              backgroundColor={backgroundColor}
              foregroundColor={foregroundColor}
            >
              <Rect x="0" y="6" rx="3" ry="3" width="40" height="8" />
            </ContentLoader>
            <ContentLoader
              speed={2}
              width={width - 32}
              height={44}
              viewBox={`0 0 ${width - 32} 44`}
              backgroundColor={backgroundColor}
              foregroundColor={foregroundColor}
            >
              <Rect x="0" y="0" rx="8" ry="8" width={width - 32} height="44" />
            </ContentLoader>
          </YStack>

          {/* Two Column Fields (Volume and Remaining %) */}
          <XStack gap="$3">
            <YStack flex={1} gap="$2">
              <ContentLoader
                speed={2}
                width={(width - 32) / 2 - 12}
                height={20}
                viewBox={`0 0 ${(width - 32) / 2 - 12} 20`}
                backgroundColor={backgroundColor}
                foregroundColor={foregroundColor}
              >
                <Rect x="0" y="6" rx="3" ry="3" width="70" height="8" />
              </ContentLoader>
              <ContentLoader
                speed={2}
                width={(width - 32) / 2 - 12}
                height={44}
                viewBox={`0 0 ${(width - 32) / 2 - 12} 44`}
                backgroundColor={backgroundColor}
                foregroundColor={foregroundColor}
              >
                <Rect x="0" y="0" rx="8" ry="8" width={(width - 32) / 2 - 12} height="44" />
              </ContentLoader>
            </YStack>
            
            <YStack flex={1} gap="$2">
              <ContentLoader
                speed={2}
                width={(width - 32) / 2 - 12}
                height={20}
                viewBox={`0 0 ${(width - 32) / 2 - 12} 20`}
                backgroundColor={backgroundColor}
                foregroundColor={foregroundColor}
              >
                <Rect x="0" y="6" rx="3" ry="3" width="80" height="8" />
              </ContentLoader>
              <ContentLoader
                speed={2}
                width={(width - 32) / 2 - 12}
                height={44}
                viewBox={`0 0 ${(width - 32) / 2 - 12} 44`}
                backgroundColor={backgroundColor}
                foregroundColor={foregroundColor}
              >
                <Rect x="0" y="0" rx="8" ry="8" width={(width - 32) / 2 - 12} height="44" />
              </ContentLoader>
            </YStack>
          </XStack>

          {/* Bottom Spacing for Submit Button */}
          <View height={60} />
        </YStack>
      </YStack>
    </Container>
  )
}

export { EditListingSkeleton as EditListingLoading }