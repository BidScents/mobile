import { UserPreview } from "@bid-scents/shared-sdk";
import { LegendList } from "@legendapp/list";
import { router } from "expo-router";
import { useCallback } from "react";
import { RefreshControl } from "react-native";
import { Text, View, XStack, YStack } from "tamagui";
import { useUserSearch } from "../../hooks/queries/use-homepage";
import { AvatarIcon } from "../ui/avatar-icon";
import { Container } from "../ui/container";
import { ThemedIonicons } from "../ui/themed-icons";
import { UserCardSkeleton } from "../ui/user-card-skeleton";


export default function UserSearchResults({ query }: { query: string }) {
  const { data, isLoading, error, refetch, isRefetching } = useUserSearch(query);

  console.log("User search query:", query);
  
  const userCard = useCallback(({ item }: { item: UserPreview }) => {
    return (
      <XStack
        alignItems="center"
        justifyContent="space-between"
        bg="$muted"
        borderRadius="$6"
        px="$4"
        py="$3"
        onPress={() => router.push(`/(screens)/user/${item.id}` as any)}
        pressStyle={{
          backgroundColor: "$mutedPress",
        }}
      >
        <XStack alignItems="center" gap="$3">
          <AvatarIcon url={item.profile_image_url} size="$5" />

          <YStack alignSelf="center" gap="$1">
            <Text fontSize="$5" fontWeight="500">
              @{item.username}
            </Text>
            <Text fontSize="$4" fontWeight="400" color="$mutedForeground">
              View profile
            </Text>
          </YStack>
        </XStack>
        <ThemedIonicons name="chevron-forward" size={20} />
      </XStack>
    );
  }, []);
  
  if (isLoading) {
    return <View gap="$4">
        <UserCardSkeleton />
        <UserCardSkeleton />
        <UserCardSkeleton />
        <UserCardSkeleton />
        <UserCardSkeleton />
        <UserCardSkeleton />
        <UserCardSkeleton />
    </View>;
  }
  
  if (error) {
    return <View flex={1} alignItems="center" justifyContent="center" padding="$6">
        <ThemedIonicons
          name="alert-circle-outline"
          size={64}
          color="red"
        />
        <Text
          fontSize="$5"
          fontWeight="500"
          color="$foreground"
          marginTop="$3"
          textAlign="center"
        >
          Failed to Load Users
        </Text>
        <Text
          fontSize="$4"
          color="$mutedForeground"
          marginTop="$2"
          textAlign="center"
        >
          Please check your connection and try again
        </Text>
      </View>
  }

  if (data?.length === 0) {
    return <View flex={1} alignItems="center" justifyContent="center" padding="$6">
        <ThemedIonicons 
          name="person-outline" 
          size={64} 
          color='$mutedForeground' 
          style={{ marginBottom: 16 }} 
        />
        <Text
          fontSize="$5"
          fontWeight="500"
          color="$foreground"
          marginTop="$3"
          textAlign="center"
        >
          No users found
        </Text>
        <Text
          fontSize="$4"
          color="$mutedForeground"
          marginTop="$2"
          textAlign="center"
        >
          Try searching for something else
        </Text>
      </View>
  }

  return (
    <Container variant="fullscreen" safeArea={false} backgroundColor="$background">
      <LegendList
        data={data || []}
        renderItem={userCard}
        contentContainerStyle={{ gap: 8, paddingTop: 12 }}
        keyExtractor={(item) => item.id}
        recycleItems
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </Container>
  );
}