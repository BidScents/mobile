import { Button } from '@/components/ui/button';
import { ThemedIonicons } from '../ui/themed-icons';
import { router } from 'expo-router';
import React from 'react';
import { Text, View } from 'tamagui';
import { useThemeColors } from '../../hooks/use-theme-colors';

interface SellersYouFollowEmptyStateProps {
  type: 'no-listings' | 'error';
  title: string;
  message: string;
  onRetry?: () => void;
}

export function SellersYouFollowEmptyState({
  type,
  title,
  message,
  onRetry
}: SellersYouFollowEmptyStateProps) {
  const colors = useThemeColors();

  const getIcon = () => {
    switch (type) {
      case 'no-listings':
        return 'people-outline';
      case 'error':
        return 'alert-circle-outline';
      default:
        return 'people-outline';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'error':
        return '#ef4444';
      default:
        return colors.mutedForeground || '#6b7280';
    }
  };

  const handleExplorePress = () => {
    router.push('/(tabs)/home/search-results?q=*' as any);
  };

  return (
    <View 
      flex={1} 
      justifyContent="center" 
      alignItems="center" 
      paddingHorizontal="$6"
      paddingVertical="$8"
    >
      <View 
        marginBottom="$4"
        alignItems="center"
        justifyContent="center"
        width={80}
        height={80}
        borderRadius={40}
        backgroundColor="$muted"
      >
        <ThemedIonicons 
          name={getIcon()} 
          size={40} 
          color={getIconColor()} 
        />
      </View>

      <Text 
        fontSize="$6" 
        fontWeight="600" 
        color="$foreground" 
        textAlign="center"
        marginBottom="$2"
      >
        {title}
      </Text>

      <Text 
        fontSize="$4" 
        color="$mutedForeground" 
        textAlign="center"
        lineHeight="$5"
        marginBottom="$6"
      >
        {message}
      </Text>

      {/* Action buttons based on type */}
      {type === 'error' && onRetry && (
        <Button 
          onPress={onRetry}
          variant="secondary"
          size="lg"
        >
          Try Again
        </Button>
      )}

      {type === 'no-listings' && (
        <Button 
          onPress={handleExplorePress}
          variant="secondary"
          size="lg"
        >
          Explore All Listings
        </Button>
      )}
    </View>
  );
}