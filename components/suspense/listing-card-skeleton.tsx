import React from 'react'
import ContentLoader, { Circle, Rect } from 'react-content-loader/native'
import { useColorScheme } from 'react-native'
import { Card } from 'tamagui'

interface ListingCardSkeletonProps {
  width?: number
  height?: number
}

/**
 * Skeleton loader for listing cards matching the exact card layout.
 * Mimics the structure of auction, fixed price, negotiable, and swap cards.
 */
export function ListingCardSkeleton({ 
  width = 170, 
  height = 280 
}: ListingCardSkeletonProps) {
  const colorScheme = useColorScheme()
  
  const backgroundColor = colorScheme === 'dark' ? '#1a1a1a' : '#f3f3f3'
  const foregroundColor = colorScheme === 'dark' ? '#2a2a2a' : '#e8e8e8'

  return (
    <Card
      size="$3"
      backgroundColor="$background"
      borderRadius="$4"
      padding="$0"
      flex={1}
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
        {/* Main image area - takes up top ~60% */}
        <Rect x="0" y="0" rx="8" ry="8" width={width} height="160" />
        
        {/* Top left badge (timer/status) */}
        <Rect x="8" y="8" rx="6" ry="6" width="50" height="18" />
        
        {/* Top right badge (bid count/type) */}
        {/* <Rect x={width - 58} y="8" rx="6" ry="6" width="50" height="18" /> */}
        
        {/* Heart/favorite button - bottom right of image */}
        <Circle cx={width - 20} cy="140" r="12" />
        
        {/* Product title */}
        <Rect x="12" y="175" rx="4" ry="4" width={width - 40} height="16" />
        
        {/* Volume/fullness info */}
        <Rect x="12" y="195" rx="3" ry="3" width={width - 60} height="12" />
        
        {/* Price/current bid */}
        <Rect x="12" y="215" rx="4" ry="4" width={width - 80} height="14" />
        
        {/* Action button at bottom */}
        <Rect x="12" y="240" rx="8" ry="8" width={width - 24} height="32" />
      </ContentLoader>
    </Card>
  )
}