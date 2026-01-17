import { DetailedProfileContainer } from "@/components/profile/detailed-profile-container";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { View, Text } from "tamagui";

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  if (!id) {
    return (
      <View flex={1} justifyContent="center" alignItems="center">
        <Text>User not found</Text>
      </View>
    );
  }

  return <DetailedProfileContainer userId={id} />;
}
