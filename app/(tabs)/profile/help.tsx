import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ThemedIonicons } from "@/components/ui/themed-icons";
import * as Haptics from "expo-haptics";
import { Alert, Linking } from "react-native";
import { ScrollView, Text, XStack, YStack } from "tamagui";

const HELP_TOPICS = [
  {
    title: "Account & Profile",
    description: "Managing your account settings and profile information",
    icon: "person",
  },
  {
    title: "Buying & Bidding",
    description: "How to purchase and bid on fragrances",
    icon: "card",
  },
  {
    title: "Selling & Listings",
    description: "Creating listings and managing your sales",
    icon: "storefront",
  },
  {
    title: "Authentication",
    description: "Fragrance verification and authenticity",
    icon: "shield-checkmark",
  },
  {
    title: "Shipping & Delivery",
    description: "Tracking orders and delivery information",
    icon: "cube",
  },
  {
    title: "Payments & Fees",
    description: "Understanding payments, fees, and payouts",
    icon: "wallet",
  },
];

export default function HelpScreen() {

  const handleContactPress = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    try {
      const emailUrl = "mailto:admin@bidscents.com?subject=Help Request - BidScents App";
      const canOpen = await Linking.canOpenURL(emailUrl);
      
      if (canOpen) {
        await Linking.openURL(emailUrl);
      } else {
        Alert.alert(
          "Email Not Available",
          "Please send your inquiry to admin@bidscents.com",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.log("Failed to open email:", error);
      Alert.alert(
        "Contact Information",
        "Please reach out to us at admin@bidscents.com for assistance.",
        [{ text: "OK" }]
      );
    }
  };

  return (
    <Container variant="padded" safeArea backgroundColor="$background">
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack gap="$6" paddingBottom="$8">
          {/* Welcome Section */}
          <YStack gap="$3" alignItems="center">
            <YStack
              backgroundColor="$muted"
              borderRadius="$8"
              padding="$4"
              alignItems="center"
              justifyContent="center"
            >
              <ThemedIonicons
                name="help-circle"
                size={48}
                color="$foreground"
              />
            </YStack>
            <YStack gap="$2" alignItems="center">
              <Text fontSize="$6" fontWeight="600" color="$foreground" textAlign="center">
                How can we help you?
              </Text>
              <Text 
                fontSize="$4" 
                color="$mutedForeground" 
                textAlign="center" 
                maxWidth={280}
                lineHeight="$5"
              >
                Find answers to common questions or contact our support team directly.
              </Text>
            </YStack>
          </YStack>

          {/* Contact Support Card */}
          <YStack
            backgroundColor="$muted"
            borderRadius="$6"
            padding="$4"
            gap="$3"
          >
            <XStack alignItems="center" gap="$3">
              <ThemedIonicons
                name="mail"
                size={24}
                color="$foreground"
              />
              <YStack flex={1}>
                <Text fontSize="$5" fontWeight="600" color="$foreground">
                  Contact Support
                </Text>
                <Text fontSize="$3" color="$mutedForeground">
                  Get help from our team
                </Text>
              </YStack>
            </XStack>
            
            <Text fontSize="$4" color="$mutedForeground" lineHeight="$5">
              Our team typically responds within 24 hours.
            </Text>
            
            <Button
              variant="primary"
              size="md"
              onPress={handleContactPress}
            >
              Send Email to Support
            </Button>
          </YStack>

          {/* Help Topics */}
          <YStack gap="$4">
            <Text fontSize="$6" fontWeight="600" color="$foreground">
              Common Topics (Coming Soon)
            </Text>
            
            <YStack gap="$3">
              {HELP_TOPICS.map((topic, index) => (
                <XStack
                  key={index}
                  backgroundColor="$muted"
                  borderRadius="$6"
                  padding="$4"
                  alignItems="center"
                  opacity={0.6}
                  gap="$3"
                  pressStyle={{
                    backgroundColor: "$mutedPress",
                  }}
                >
                  <YStack
                    backgroundColor="$background"
                    borderRadius="$5"
                    padding="$2"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <ThemedIonicons
                      name={topic.icon as any}
                      size={20}
                      color="$foreground"
                    />
                  </YStack>
                  
                  <YStack flex={1} gap="$1">
                    <Text fontSize="$4" fontWeight="500" color="$foreground">
                      {topic.title}
                    </Text>
                    <Text fontSize="$3" color="$mutedForeground" lineHeight="$4">
                      {topic.description}
                    </Text>
                  </YStack>
                </XStack>
              ))}
            </YStack>
          </YStack>
        </YStack>
      </ScrollView>
    </Container>
  );
}
