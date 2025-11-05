import { LegalDocumentsBottomSheet, LegalDocumentsBottomSheetMethods } from "@/components/forms/legal-documents-bottom-sheet";
import { AvatarIcon } from "@/components/ui/avatar-icon";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ThemedIonicons } from "@/components/ui/themed-icons";
import { handleSignOutUI } from "@/utils/auth-ui-handlers";
import { useAuthStore } from "@bid-scents/shared-sdk";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useRef } from "react";
import { Alert } from "react-native";
import { ScrollView, Text, XStack, YStack } from "tamagui";

const SettingsSections = [
  {
    title: "General",
    sections: [
      {
        name: "Favourite Listings",
        icon: "heart-outline",
        src: "/profile/favourite-listings",
      },
      {
        name: "My Orders",
        icon: "cube-outline",
        src: "/profile/orders",
      },
      {
        name: "Seller Dashboard",
        icon: "storefront-outline",
        src: "/profile/seller-dashboard",
      },
      {
        name: "Settings",
        icon: "settings-outline",
        src: "/profile/settings",
      },
    ],
  },
  {
    title: "Support and Information",
    sections: [
      {
        name: "Help Center",
        icon: "help-circle-outline",
        src: "/profile/help",
      },
      {
        name: "Terms and Conditions",
        icon: "document-text-outline",
        action: "terms",
      },
      {
        name: "Privacy Policy",
        icon: "shield-checkmark-outline",
        action: "privacy",
      },
    ],
  },
];

export default function ProfileScreen() {
  const { user } = useAuthStore();
  const legalBottomSheetRef = useRef<LegalDocumentsBottomSheetMethods>(null);

  const {session} = useAuthStore();
  // console.log(session);

  const handlePress = (item: { src?: string; action?: string }) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (item.src) {
      router.push(item.src as any);
    } else if (item.action === "terms") {
      legalBottomSheetRef.current?.presentWithTab('terms');
    } else if (item.action === "privacy") {
      legalBottomSheetRef.current?.presentWithTab('privacy');
    }
  };

  const handleProfilePress = (link: string) => {
    router.push(link as any);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleLogout = () => {
      Alert.alert("Log Out", "Are you sure you want to log out?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            handleSignOutUI();
            router.dismissTo("/(auth)");
          },
        },
      ]);
    };
    
  return (
    <Container variant="padded" safeArea={false} backgroundColor="$background">
      <ScrollView
        contentContainerStyle={{ gap: "$5", backgroundColor: "$background" }}
      >
        {/* Profile Card */}
        <XStack
          alignItems="center"
          justifyContent="space-between"
          bg="$muted"
          borderRadius="$6"
          px="$4"
          py="$3"
          onPress={() => handleProfilePress(`/profile/${user?.id}`)}
          pressStyle={{
            backgroundColor: "$mutedPress",
          }}
        >
          <XStack alignItems="center" gap="$3">
            <AvatarIcon url={user?.profile_image_url} size="$5" />

            <YStack alignSelf="center" gap="$1">
              <Text fontSize="$5" fontWeight="500">
                @{user?.username}
              </Text>
              <Text fontSize="$4" fontWeight="400">
                View my profile
              </Text>
            </YStack>
          </XStack>
          <ThemedIonicons
            name="chevron-forward"
            size={20}
          />
        </XStack>

        {/* Settings */}
        <YStack gap="$5">
          {SettingsSections.map((section, index) => (
            <YStack key={index} gap="$3">
              <Text fontSize="$5" fontWeight="500">
                {section.title}
              </Text>
              <YStack borderRadius="$6" backgroundColor="$muted">
                {section.sections.map((item, index) => (
                  <XStack
                    key={index}
                    alignItems="center"
                    justifyContent="space-between"
                    px="$4"
                    py="$4"
                    borderRadius="$6"
                    onPress={() => handlePress(item)}
                    pressStyle={{
                      backgroundColor: "$mutedPress",
                    }}
                  >
                    <XStack
                      alignItems="center"
                      justifyContent="center"
                      gap="$2"
                    >
                      <ThemedIonicons
                        name={item.icon as any}
                        size={20}
                      />
                      <Text fontSize="$5" fontWeight="400">
                        {item.name}
                      </Text>
                    </XStack>
                    <ThemedIonicons
                      name="chevron-forward"
                      size={20}
                    />
                  </XStack>
                ))}
              </YStack>
            </YStack>
          ))}
          {/* Logout Section */}
          <YStack borderRadius="$6">
            <Button
              onPress={handleLogout}
              variant="secondary"
              leftIcon="log-out-outline"
            >
              Log Out
            </Button>
          </YStack>
        </YStack>
      </ScrollView>

      {/* Legal Documents Bottom Sheet */}
      <LegalDocumentsBottomSheet ref={legalBottomSheetRef} />
    </Container>
  );
}
