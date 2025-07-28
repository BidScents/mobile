import React from 'react';
import { Text, View } from 'tamagui';
import { EMPTY_STATES } from '../../constants/profile-content-tab.constants';
import type { ContentType } from '../../types/profile-content-tab.types';

interface ProfileContentEmptyProps {
  contentType: ContentType;
}

export const ProfileContentEmpty = React.memo(function ProfileContentEmpty({ 
  contentType 
}: ProfileContentEmptyProps) {
  const emptyState = EMPTY_STATES[contentType];

  return (
    <View flex={1} justifyContent="center" alignItems="center" paddingHorizontal="$4" minHeight={400}>
      <Text fontSize="$6" fontWeight="600" color="$mutedForeground" textAlign="center">
        {emptyState.title}
      </Text>
      <Text fontSize="$4" color="$mutedForeground" textAlign="center" marginTop="$2">
        {emptyState.description}
      </Text>
    </View>
  );
});
