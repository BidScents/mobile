import { Container } from '@/components/ui/container'
import React from 'react'
import ContentLoader, { Circle, Rect } from 'react-content-loader/native'
import { useColorScheme } from 'react-native'
import { View, XStack, YStack } from 'tamagui'

interface ProfileSkeletonProps {
  width?: number
}

/**
 * Comprehensive skeleton loader for profile pages that matches the actual profile layout.
 * Includes cover image, profile avatar, user info, stats, tabs, and listings grid.
 */
export function ProfileSkeleton({ width = 390 }: ProfileSkeletonProps) {
  const colorScheme = useColorScheme()
  
  // Darker greys for better visibility
  const backgroundColor = colorScheme === 'dark' ? '#151515' : '#e8e8e8'
  const foregroundColor = colorScheme === 'dark' ? '#252525' : '#d0d0d0'

  return (
    <YStack flex={1} backgroundColor="$background">
      {/* Header with Cover Image and Profile Info - Full Width */}
      <View height={220} overflow="visible" marginHorizontal={0} paddingHorizontal={0}>
        <ContentLoader
          speed={2}
          width={width}
          height={220}
          viewBox={`0 0 ${width} 220`}
          backgroundColor={backgroundColor}
          foregroundColor={foregroundColor}
        >
          {/* Cover Image - Fixed to span full width */}
          <Rect x="0" y="0" rx="0" ry="10" width={width} height="120" />
          
          {/* Settings Icon (top right) */}
          <Circle cx={width - 30} cy="60" r="12" />
          
          {/* Back button (top left) */}
          <Circle cx="30" cy="60" r="12" />
          
          {/* Profile Avatar - right side, overlapping cover */}
          <Circle cx={width - 90} cy="180" r="40" />
          
          {/* User Name - left side */}
          <Rect x="20" y="140" rx="4" ry="4" width="160" height="18" />
          
          {/* Username - left side */}
          <Rect x="20" y="165" rx="3" ry="3" width="100" height="12" />
          
          {/* Member since - left side */}
          <Rect x="20" y="185" rx="3" ry="3" width="80" height="10" />
        </ContentLoader>
      </View>

      {/* Rest of content with proper container */}
      <Container variant="fullscreen" safeArea={false} backgroundColor="$background">

        {/* Stats Section */}
        <View height={70} paddingHorizontal="$4" paddingVertical="$2">
          <ContentLoader
            speed={2}
            width={width - 32}
            height={50}
            viewBox={`0 0 ${width - 32} 50`}
            backgroundColor={backgroundColor}
            foregroundColor={foregroundColor}
          >
            {/* Following count */}
            <Rect x="0" y="5" rx="3" ry="3" width="25" height="14" />
            <Rect x="0" y="25" rx="3" ry="3" width="55" height="10" />
            
            {/* Followers count */}
            <Rect x="90" y="5" rx="3" ry="3" width="30" height="14" />
            <Rect x="90" y="25" rx="3" ry="3" width="60" height="10" />
          </ContentLoader>
        </View>

        {/* Bio Section */}
        <View height={50} paddingHorizontal="$4">
          <ContentLoader
            speed={2}
            width={width - 32}
            height={35}
            viewBox={`0 0 ${width - 32} 35`}
            backgroundColor={backgroundColor}
            foregroundColor={foregroundColor}
          >
            <Rect x="0" y="5" rx="3" ry="3" width={width - 80} height="10" />
          </ContentLoader>
        </View>

        {/* Seller Dashboard Button */}
        <View height={60} paddingHorizontal="$4" paddingVertical="$2">
          <ContentLoader
            speed={2}
            width={width - 32}
            height={45}
            viewBox={`0 0 ${width - 32} 45`}
            backgroundColor={backgroundColor}
            foregroundColor={foregroundColor}
          >
            <Rect x="0" y="5" rx="8" ry="8" width={width - 32} height="35" />
          </ContentLoader>
        </View>

        {/* Tab Navigation */}
        <View height={50} paddingHorizontal="$4">
          <ContentLoader
            speed={2}
            width={width - 32}
            height={35}
            viewBox={`0 0 ${width - 32} 35`}
            backgroundColor={backgroundColor}
            foregroundColor={foregroundColor}
          >
            {/* Tab items - Active, Featured, Sold, Reviews */}
            <Rect x="0" y="10" rx="4" ry="4" width="50" height="20" />
            <Rect x="70" y="10" rx="4" ry="4" width="60" height="20" />
            <Rect x="150" y="10" rx="4" ry="4" width="40" height="20" />
            <Rect x="210" y="10" rx="4" ry="4" width="55" height="20" />
          </ContentLoader>
        </View>

        {/* Results Count and Sort */}
        <View height={35} paddingHorizontal="$4">
          <ContentLoader
            speed={2}
            width={width - 32}
            height={20}
            viewBox={`0 0 ${width - 32} 20`}
            backgroundColor={backgroundColor}
            foregroundColor={foregroundColor}
          >
            <Rect x="0" y="5" rx="3" ry="3" width="70" height="12" />
            <Rect x={width - 120} y="5" rx="3" ry="3" width="80" height="12" />
          </ContentLoader>
        </View>

        {/* Listings Grid - Multiple rows to fill screen */}
        <YStack flex={1} paddingHorizontal="$4">
          <XStack gap="$3" marginBottom="$3">
            <ListingCardSkeleton width={170} height={240} />
            <ListingCardSkeleton width={170} height={240} />
          </XStack>
          <XStack gap="$3" marginBottom="$3">
            <ListingCardSkeleton width={170} height={240} />
            <ListingCardSkeleton width={170} height={240} />
          </XStack>
          <XStack gap="$3" marginBottom="$3">
            <ListingCardSkeleton width={170} height={240} />
            <ListingCardSkeleton width={170} height={240} />
          </XStack>
          <XStack gap="$3" marginBottom="$3">
            <ListingCardSkeleton width={170} height={240} />
            <ListingCardSkeleton width={170} height={240} />
          </XStack>
          <XStack gap="$3" marginBottom="$3">
            <ListingCardSkeleton width={170} height={240} />
            <ListingCardSkeleton width={170} height={240} />
          </XStack>
          <XStack gap="$3" marginBottom="$3">
            <ListingCardSkeleton width={170} height={240} />
            <ListingCardSkeleton width={170} height={240} />
          </XStack>
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
  const colorScheme = useColorScheme()
  
  // Darker greys for better visibility
  const backgroundColor = colorScheme === 'dark' ? '#151515' : '#e8e8e8'
  const foregroundColor = colorScheme === 'dark' ? '#252525' : '#d0d0d0'

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
        {/* Image area */}
        <Rect x="0" y="0" rx="8" ry="8" width={width} height="150" />
        
        {/* Auction timer (1d 19h 7m) - top left */}
        <Rect x="8" y="8" rx="4" ry="4" width="60" height="16" />
        
        {/* Bid count (0 bids) - top right */}
        <Rect x={width - 50} y="8" rx="4" ry="4" width="42" height="16" />
        
        {/* Heart icon with count */}
        <Circle cx={width - 25} cy={height - 70} r="12" />
        <Rect x={width - 35} y={height - 55} rx="2" ry="2" width="20" height="8" />
        
        {/* Title */}
        <Rect x="8" y="165" rx="3" ry="3" width={width - 40} height="14" />
        
        {/* Details (100% full • 50ml) */}
        <Rect x="8" y="185" rx="3" ry="3" width={width - 60} height="10" />
        
        {/* Current bid price */}
        <Rect x="8" y="205" rx="3" ry="3" width="80" height="12" />
      </ContentLoader>
    </View>
  )
}

export { ProfileSkeleton as ProfileLoading }
