import React from 'react';
import { Text, XStack } from 'tamagui';
import { useThemeColors } from '../../hooks/use-theme-colors';
import type { ContentType } from '../../types/profile-content-tab.types';
import { ThemedIonicons } from '../ui/themed-icons';

interface ProfileContentHeaderProps {
  contentType: ContentType;
  dataLength: number;
  currentSortLabel: string;
  onSortPress: () => void;
  showSort: boolean;
}

export const ProfileContentHeader = React.memo(function ProfileContentHeader({
  contentType,
  dataLength,
  currentSortLabel,
  onSortPress,
  showSort
}: ProfileContentHeaderProps) {
  const colors = useThemeColors();
  
  const getHeaderText = () => {
    if (contentType === 'reviews') {
      return `${dataLength}+ Reviews`;
    }
    return `${dataLength} Results`;
  };

  return (
    <XStack alignItems="center" justifyContent="space-between" paddingHorizontal="$4">
      <Text fontSize="$4" fontWeight="500" color="$mutedForeground">
        {getHeaderText()}
      </Text>
      {showSort && (
        <XStack 
          alignItems="center" 
          justifyContent="center" 
          onPress={onSortPress} 
          hitSlop={16}
          pressStyle={{ opacity: 0.7 }}
        >
          <Text fontSize="$4" fontWeight="500" color="$mutedForeground">
            {currentSortLabel}
          </Text>
          <ThemedIonicons name="chevron-down" size={16} color={colors.mutedForeground} />
        </XStack>
      )}
    </XStack>
  );
});
