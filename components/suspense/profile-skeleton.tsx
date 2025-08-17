import { Container } from '@/components/ui/container'
import React from 'react'
import ContentLoader, { Circle, Rect } from 'react-content-loader/native'
import { Dimensions } from 'react-native'
import { View, XStack, YStack, useTheme } from 'tamagui'

interface ProfileSkeletonProps {
  width?: number
}

/**
 * Comprehensive skeleton loader for profile pages that matches the actual profile layout.
 * Includes cover image, profile avatar, user info, stats, tabs, and listings grid.
 */
export function ProfileSkeleton({ width }: ProfileSkeletonProps) {
  const theme = useTheme()
  const screenWidth = width || Dimensions.get('window').width
  
  // Use theme colors for skeleton loading
  const backgroundColor = theme.muted?.get() || '#e8e8e8'
  const foregroundColor = theme.mutedHover?.get() || '#d0d0d0'

  return (
    <YStack flex={1} backgroundColor="$background">
      {/* Header with Cover Image and Profile Info - Full Width */}
      <View height={220} overflow="visible" marginHorizontal={0} paddingHorizontal={0}>
        <ContentLoader
          speed={2}
          width={screenWidth}
          height={220}
          viewBox={`0 0 ${screenWidth} 220`}
          backgroundColor={backgroundColor}
          foregroundColor={foregroundColor}
        >
          {/* Cover Image - Full width */}
          <Rect x="0" y="0" rx="0" ry="10" width={screenWidth} height="120" />
          
          {/* Settings Icon (top right) */}
          <Circle cx={screenWidth - 30} cy="60" r="12" />
          
          {/* Back button (top left) */}
          <Circle cx="30" cy="60" r="12" />
          
          {/* Profile Avatar - right side, overlapping cover */}
          <Circle cx={screenWidth - 90} cy="180" r="40" />
          
          {/* User Name - left side, responsive width */}
          <Rect x="20" y="140" rx="4" ry="4" width={screenWidth * 0.4} height="18" />
          
          {/* Username - left side, responsive width */}
          <Rect x="20" y="165" rx="3" ry="3" width={screenWidth * 0.25} height="12" />
          
          {/* Member since - left side, responsive width */}
          <Rect x="20" y="185" rx="3" ry="3" width={screenWidth * 0.2} height="10" />
        </ContentLoader>
      </View>

      {/* Rest of content with proper container */}
      <Container variant="fullscreen" safeArea={false} backgroundColor="$background">

        {/* Stats Section */}
        <View height={70} paddingHorizontal="$4" paddingVertical="$2">
          <ContentLoader
            speed={2}
            width={screenWidth - 32}
            height={50}
            viewBox={`0 0 ${screenWidth - 32} 50`}
            backgroundColor={backgroundColor}
            foregroundColor={foregroundColor}
          >
            {/* Following count */}
            <Rect x="0" y="5" rx="3" ry="3" width="25" height="14" />
            <Rect x="0" y="25" rx="3" ry="3" width="55" height="10" />
            
            {/* Followers count */}
            <Rect x={(screenWidth - 32) * 0.25} y="5" rx="3" ry="3" width="30" height="14" />
            <Rect x={(screenWidth - 32) * 0.25} y="25" rx="3" ry="3" width="60" height="10" />
          </ContentLoader>
        </View>

        {/* Bio Section */}
        <View height={50} paddingHorizontal="$4">
          <ContentLoader
            speed={2}
            width={screenWidth - 32}
            height={35}
            viewBox={`0 0 ${screenWidth - 32} 35`}
            backgroundColor={backgroundColor}
            foregroundColor={foregroundColor}
          >
            <Rect x="0" y="5" rx="3" ry="3" width={(screenWidth - 32) * 0.85} height="10" />
          </ContentLoader>
        </View>

        {/* Seller Dashboard Button */}
        <View height={60} paddingHorizontal="$4" paddingVertical="$2">
          <ContentLoader
            speed={2}
            width={screenWidth - 32}
            height={45}
            viewBox={`0 0 ${screenWidth - 32} 45`}
            backgroundColor={backgroundColor}
            foregroundColor={foregroundColor}
          >
            <Rect x="0" y="5" rx="8" ry="8" width={screenWidth - 32} height="35" />
          </ContentLoader>
        </View>

        {/* Tab Navigation */}
        <View height={50} paddingHorizontal="$4">
          <ContentLoader
            speed={2}
            width={screenWidth - 32}
            height={35}
            viewBox={`0 0 ${screenWidth - 32} 35`}
            backgroundColor={backgroundColor}
            foregroundColor={foregroundColor}
          >
            {/* Tab items - Active, Featured, Sold, Reviews - responsive spacing */}
            <Rect x="0" y="10" rx="4" ry="4" width={(screenWidth - 32) * 0.15} height="20" />
            <Rect x={(screenWidth - 32) * 0.2} y="10" rx="4" ry="4" width={(screenWidth - 32) * 0.18} height="20" />
            <Rect x={(screenWidth - 32) * 0.45} y="10" rx="4" ry="4" width={(screenWidth - 32) * 0.12} height="20" />
            <Rect x={(screenWidth - 32) * 0.65} y="10" rx="4" ry="4" width={(screenWidth - 32) * 0.16} height="20" />
          </ContentLoader>
        </View>

        {/* Results Count and Sort */}
        <View height={35} paddingHorizontal="$4">
          <ContentLoader
            speed={2}
            width={screenWidth - 32}
            height={20}
            viewBox={`0 0 ${screenWidth - 32} 20`}
            backgroundColor={backgroundColor}
            foregroundColor={foregroundColor}
          >
            <Rect x="0" y="5" rx="3" ry="3" width={(screenWidth - 32) * 0.2} height="12" />
            <Rect x={(screenWidth - 32) * 0.75} y="5" rx="3" ry="3" width={(screenWidth - 32) * 0.22} height="12" />
          </ContentLoader>
        </View>

        {/* Listings Grid - Multiple rows to fill screen */}
        <YStack flex={1} paddingHorizontal="$4">
          {/* Calculate responsive card width: (screenWidth - padding - gap) / 2 */}
          {(() => {
            const cardWidth = (screenWidth - 32 - 12) / 2; // 32 for padding, 12 for gap
            const cardHeight = cardWidth * 1.4; // Maintain aspect ratio
            
            return (
              <>
                <XStack gap="$3" marginBottom="$3">
                  <ListingCardSkeleton width={cardWidth} height={cardHeight} />
                  <ListingCardSkeleton width={cardWidth} height={cardHeight} />
                </XStack>
                <XStack gap="$3" marginBottom="$3">
                  <ListingCardSkeleton width={cardWidth} height={cardHeight} />
                  <ListingCardSkeleton width={cardWidth} height={cardHeight} />
                </XStack>
                <XStack gap="$3" marginBottom="$3">
                  <ListingCardSkeleton width={cardWidth} height={cardHeight} />
                  <ListingCardSkeleton width={cardWidth} height={cardHeight} />
                </XStack>
                <XStack gap="$3" marginBottom="$3">
                  <ListingCardSkeleton width={cardWidth} height={cardHeight} />
                  <ListingCardSkeleton width={cardWidth} height={cardHeight} />
                </XStack>
                <XStack gap="$3" marginBottom="$3">
                  <ListingCardSkeleton width={cardWidth} height={cardHeight} />
                  <ListingCardSkeleton width={cardWidth} height={cardHeight} />
                </XStack>
                <XStack gap="$3" marginBottom="$3">
                  <ListingCardSkeleton width={cardWidth} height={cardHeight} />
                  <ListingCardSkeleton width={cardWidth} height={cardHeight} />
                </XStack>
              </>
            );
          })()}
        </YStack>
      </Container>
    </YStack>
  )
}

/**
 * Enhanced listing card skeleton matching the actual listing layout
 * Includes auction timer, bid count, and proper spacing
 */
function ListingCardSkeleton({ width, height }: { width: number; height: number }) {
  const theme = useTheme()
  
  // Use theme colors for skeleton loading
  const backgroundColor = theme.muted?.get() || '#e8e8e8'
  const foregroundColor = theme.mutedHover?.get() || '#d0d0d0'

  return (
    <View
      backgroundColor="$background"
      borderRadius="$4"
      overflow="hidden"
    >
      <ContentLoader
        speed={2}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        backgroundColor={backgroundColor}
        foregroundColor={foregroundColor}
      >
        {/* Image area - responsive height based on card proportions */}
        <Rect x="0" y="0" rx="8" ry="8" width={width} height={height * 0.6} />
        
        {/* Auction timer (1d 19h 7m) - top left */}
        <Rect x="8" y="8" rx="4" ry="4" width={width * 0.35} height="16" />
        
        {/* Bid count (0 bids) - top right */}
        <Rect x={width - (width * 0.3)} y="8" rx="4" ry="4" width={width * 0.25} height="16" />
        
        {/* Heart icon with count */}
        <Circle cx={width - 25} cy={height - (height * 0.25)} r="12" />
        <Rect x={width - 35} y={height - (height * 0.2)} rx="2" ry="2" width="20" height="8" />
        
        {/* Title */}
        <Rect x="8" y={height * 0.67} rx="3" ry="3" width={width * 0.8} height="14" />
        
        {/* Details (100% full • 50ml) */}
        <Rect x="8" y={height * 0.75} rx="3" ry="3" width={width * 0.7} height="10" />
        
        {/* Current bid price */}
        <Rect x="8" y={height * 0.82} rx="3" ry="3" width={width * 0.45} height="12" />
      </ContentLoader>
    </View>
  )
}

export { ProfileSkeleton as ProfileLoading }
