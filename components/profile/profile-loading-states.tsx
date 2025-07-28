import React from 'react';
import { ActivityIndicator } from 'react-native';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { router } from 'expo-router';
import { Text, View } from 'tamagui';

interface ProfileLoadingProps {
  theme: any;
}

export const ProfileLoading: React.FC<ProfileLoadingProps> = ({ theme }) => {
  return (
    <Container variant="fullscreen" safeArea backgroundColor="$background">
      <View flex={1} justifyContent="center" alignItems="center">
        <ActivityIndicator size="large" color={theme.foreground?.val} />
        <Text marginTop="$4" color="$mutedForeground">
          Loading profile...
        </Text>
      </View>
    </Container>
  );
};

interface ProfileErrorProps {
  error?: { message?: string };
}

export const ProfileError: React.FC<ProfileErrorProps> = ({ error }) => {
  return (
    <Container variant="fullscreen" safeArea backgroundColor="$background">
      <View flex={1} justifyContent="center" alignItems="center">
        <Text color="$red" fontSize="$6" fontWeight="600">
          Failed to load profile
        </Text>
        <Text color="$mutedForeground" marginTop="$2">
          {error?.message || "Profile not found"}
        </Text>
        <Button
          marginTop="$4"
          variant="outline"
          onPress={() => router.back()}
        >
          Go Back
        </Button>
      </View>
    </Container>
  );
};
