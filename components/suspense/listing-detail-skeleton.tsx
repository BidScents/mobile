import { Container } from '@/components/ui/container'
import React from 'react'
import ContentLoader, { Circle, Rect } from 'react-content-loader/native'
import { Dimensions } from 'react-native'
import { View, YStack, useTheme } from 'tamagui'

interface ListingDetailSkeletonProps {
  width?: number
}

/**
 * Comprehensive skeleton loader for listing detail pages
 * Matches the exact layout from the provided image with image carousel, 
 * seller info, listing details, description, and action buttons
 */
export function ListingDetailSkeleton({ width = Dimensions.get('window').width }: ListingDetailSkeletonProps) {
  const theme = useTheme()
  const height = Dimensions.get('window').height * 0.55
  
  // Use theme colors for skeleton loading
  const backgroundColor = theme.muted?.get() || '#e8e8e8'
  const foregroundColor = theme.mutedHover?.get() || '#d0d0d0'

  return (
    <Container
      variant="fullscreen"
      safeArea={false}
      backgroundColor="$background"
    >
      {/* Back Button - Top Left */}
      <View position="absolute" top={60} left={20} zIndex={10}>
        <ContentLoader
          speed={2}
          width={40}
          height={40}
          viewBox="0 0 40 40"
          backgroundColor={foregroundColor}
          foregroundColor={backgroundColor}
        >
          <Circle cx="20" cy="20" r="20" />
        </ContentLoader>
      </View>

      {/* Heart Button - Top Right */}
      <View position="absolute" top={60} right={20} zIndex={10}>
        <ContentLoader
          speed={2}
          width={40}
          height={40}
          viewBox="0 0 40 40"
          backgroundColor={foregroundColor}
          foregroundColor={backgroundColor}
        >
          <Circle cx="20" cy="20" r="20" />
        </ContentLoader>
      </View>

      <YStack flex={1}>
        {/* Image Carousel */}
        <View height={height} width={width}>
          <ContentLoader
            speed={2}
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            backgroundColor={backgroundColor}
            foregroundColor={foregroundColor}
          >
            {/* Main Image */}
            <Rect x="0" y="0" rx="0" ry="0" width={width} height={height} />
            
            {/* Page indicators - bottom center */}
            <Circle cx={width/2 - 20} cy={height - 30} r="4" />
            <Circle cx={width/2} cy={height - 30} r="4" />
            <Circle cx={width/2 + 20} cy={height - 30} r="4" />
          </ContentLoader>
        </View>

        {/* Content Section */}
        <YStack flex={1} paddingHorizontal="$4" paddingTop="$3" gap="$4">
          
          {/* Seller Card */}
          <View height={60}>
            <ContentLoader
              speed={2}
              width={width - 32}
              height={60}
              viewBox={`0 0 ${width - 32} 60`}
              backgroundColor={backgroundColor}
              foregroundColor={foregroundColor}
            >
              {/* Profile Avatar */}
              <Circle cx="30" cy="30" r="20" />
              
              {/* Username */}
              <Rect x="60" y="20" rx="3" ry="3" width="100" height="12" />
              
              {/* "Checkout my store!" text */}
              <Rect x="60" y="36" rx="3" ry="3" width="120" height="10" />
              
              {/* View Store button */}
              <Rect x={width - 140} y="18" rx="6" ry="6" width="100" height="24" />
            </ContentLoader>
          </View>

          {/* Listing Title and Brand */}
          <View height={80}>
            <ContentLoader
              speed={2}
              width={width - 32}
              height={80}
              viewBox={`0 0 ${width - 32} 80`}
              backgroundColor={backgroundColor}
              foregroundColor={foregroundColor}
            >
              {/* Listing Name */}
              <Rect x="0" y="0" rx="4" ry="4" width="250" height="20" />
              
              {/* Brand Name */}
              <Rect x="0" y="28" rx="3" ry="3" width="80" height="14" />
              
              {/* Price */}
              <Rect x="0" y="52" rx="4" ry="4" width="100" height="18" />
            </ContentLoader>
          </View>

          {/* Remaining percentage and description */}
          <View height={40}>
            <ContentLoader
              speed={2}
              width={width - 32}
              height={40}
              viewBox={`0 0 ${width - 32} 40`}
              backgroundColor={backgroundColor}
              foregroundColor={foregroundColor}
            >
              {/* "92ml left" text */}
              <Rect x="0" y="0" rx="3" ry="3" width="80" height="12" />
              
              {/* Additional details */}
              <Rect x="0" y="20" rx="3" ry="3" width="200" height="10" />
            </ContentLoader>
          </View>

          {/* Description Text */}
          <View height={60}>
            <ContentLoader
              speed={2}
              width={width - 32}
              height={60}
              viewBox={`0 0 ${width - 32} 60`}
              backgroundColor={backgroundColor}
              foregroundColor={foregroundColor}
            >
              {/* Description lines */}
              <Rect x="0" y="0" rx="3" ry="3" width={width - 32} height="10" />
              <Rect x="0" y="15" rx="3" ry="3" width={width - 60} height="10" />
              <Rect x="0" y="30" rx="3" ry="3" width={width - 100} height="10" />
              
              {/* Show more button */}
              <Rect x="0" y="45" rx="3" ry="3" width="70" height="10" />
            </ContentLoader>
          </View>

          {/* Listing Details Section */}
          <View height={120}>
            <ContentLoader
              speed={2}
              width={width - 32}
              height={120}
              viewBox={`0 0 ${width - 32} 120`}
              backgroundColor={backgroundColor}
              foregroundColor={foregroundColor}
            >
              {/* Details rows */}
              <Rect x="0" y="0" rx="3" ry="3" width="80" height="12" />
              <Rect x={width - 150} y="0" rx="3" ry="3" width="100" height="12" />
              
              <Rect x="0" y="20" rx="3" ry="3" width="90" height="12" />
              <Rect x={width - 120} y="20" rx="3" ry="3" width="80" height="12" />
              
              <Rect x="0" y="40" rx="3" ry="3" width="70" height="12" />
              <Rect x={width - 100} y="40" rx="3" ry="3" width="70" height="12" />
              
              <Rect x="0" y="60" rx="3" ry="3" width="100" height="12" />
              <Rect x={width - 140} y="60" rx="3" ry="3" width="90" height="12" />
              
              <Rect x="0" y="80" rx="3" ry="3" width="85" height="12" />
              <Rect x={width - 160} y="80" rx="3" ry="3" width="110" height="12" />
            </ContentLoader>
          </View>

          {/* Comments Section Header */}
          <View height={40}>
            <ContentLoader
              speed={2}
              width={width - 32}
              height={40}
              viewBox={`0 0 ${width - 32} 40`}
              backgroundColor={backgroundColor}
              foregroundColor={foregroundColor}
            >
              {/* Comments title */}
              <Rect x="0" y="10" rx="4" ry="4" width="100" height="16" />
              
              {/* Vote buttons */}
              <Circle cx={width - 80} cy="20" r="15" />
              <Circle cx={width - 40} cy="20" r="15" />
            </ContentLoader>
          </View>

          {/* Comment Items */}
          <View height={80}>
            <ContentLoader
              speed={2}
              width={width - 32}
              height={80}
              viewBox={`0 0 ${width - 32} 80`}
              backgroundColor={backgroundColor}
              foregroundColor={foregroundColor}
            >
              {/* First comment */}
              <Circle cx="20" cy="25" r="12" />
              <Rect x="40" y="20" rx="3" ry="3" width="80" height="10" />
              <Rect x="40" y="35" rx="3" ry="3" width={width - 80} height="8" />
              
              {/* Second comment */}
              <Circle cx="20" cy="65" r="12" />
              <Rect x="40" y="60" rx="3" ry="3" width="90" height="10" />
            </ContentLoader>
          </View>
        </YStack>

        {/* Bottom Contact Button */}
        <View position="absolute" bottom={40} left={20} right={20}>
          <ContentLoader
            speed={2}
            width={width - 40}
            height={50}
            viewBox={`0 0 ${width - 40} 50`}
            backgroundColor={backgroundColor}
            foregroundColor={foregroundColor}
          >
            <Rect x="0" y="0" rx="25" ry="25" width={width - 40} height="50" />
          </ContentLoader>
        </View>
      </YStack>
    </Container>
  )
}

export { ListingDetailSkeleton as ListingDetailLoading }
