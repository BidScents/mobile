import { Button } from "@/components/ui/button";
import { ThemedIonicons } from "@/components/ui/themed-icons";
import { useThemeColors } from "@/hooks/use-theme-colors";
import React from "react";
import { Dimensions } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import Carousel, {
  ICarouselInstance,
  Pagination,
} from "react-native-reanimated-carousel";
import { Text, View, XStack, YStack } from "tamagui";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  icon: string;
  bullets?: string[];
}

const onboardingData: OnboardingSlide[] = [
  {
    id: "1",
    title: "Getting Started with Stripe Connect",
    description: "To start selling and receiving payouts",
    icon: "card-outline",
    bullets: [
      "Secure payments between buyers and sellers",
      "Receive payments from your sales", 
      "Link your bank account to receive earnings",

    ]
  },
  {
    id: "2", 
    title: "Account Setup",
    description: "Provide some information to verify your identity.",
    icon: "person-outline",
    bullets: [
      "Full name or business name",
      "Email address and IC/Business number",
      "Home address and contact details",
      "Business details (TIN, SST if applicable)",
    ]
  },
  {
    id: "3",
    title: "Bank Account Linking", 
    description: "Connect your bank account to receive payouts.",
    icon: "card-outline",
    bullets: [
      "Choose your preferred bank",
      "Enter your account number",
      "Confirm account details",
    ]
  },
  {
    id: "4",
    title: "Final Steps",
    description: "Complete your profile setup and start selling!",
    icon: "checkmark-circle-outline",
    bullets: [
      "Fill in statement descriptor",
      "Add customer support phone number", 
      "Profile review (up to 10 minutes)",
    ]
  }
];

export interface OnboardingGuideCarouselProps {
  onComplete: () => void;
  onSkip: () => void;
  loading: boolean;
}

export function OnboardingGuideCarousel({ onComplete, onSkip, loading }: OnboardingGuideCarouselProps) {
  const colors = useThemeColors();
  const carouselRef = React.useRef<ICarouselInstance>(null);
  const progress = useSharedValue<number>(0);
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const renderSlide = ({ item, index }: { item: OnboardingSlide; index: number }) => (
    <View 
      width={SCREEN_WIDTH - 32}
      paddingHorizontal="$4"
    >
      <YStack gap="$4" alignItems="center">
        {/* Icon */}
        <View
          backgroundColor="$blue2"
          padding="$4"
          borderRadius="$6"
        >
          <ThemedIonicons 
            name={item.icon as any}
            size={32}
            color="$blue11"
          />
        </View>

        {/* Title */}
        <Text
          fontSize="$6"
          fontWeight="600"
          color="$foreground"
          textAlign="center"
        >
          {item.title}
        </Text>

        {/* Description */}
        <Text
          fontSize="$4"
          color="$mutedForeground"
          textAlign="center"
          lineHeight="$5"
        >
          {item.description}
        </Text>

        {/* Bullets */}
        {item.bullets && (
          <YStack gap="$3" alignSelf="stretch">
            {item.bullets.map((bullet, index) => (
              <XStack key={index} gap="$2" alignItems="center" justifyContent="center">
                <ThemedIonicons name="radio-button-on-outline" size={16} color="$blue11" />
                <Text
                  fontSize="$4"
                  color="$foreground"
                  flex={1}
                >
                  {bullet}
                </Text>
              </XStack>
            ))}
          </YStack>
        )}
      </YStack>
    </View>
  );

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      carouselRef.current?.next();
    } else {
      if (loading) return;
      onComplete();
    }
  };

  const onPressPagination = (index: number) => {
    carouselRef.current?.scrollTo({
      count: index - currentIndex,
      animated: true,
    });
    setCurrentIndex(index);
  };

  return (
    <YStack gap="$4">
      {/* Carousel */}
      <View>
        <Carousel
          ref={carouselRef}
          width={SCREEN_WIDTH - 32}
          height={320}
          data={onboardingData}
          onProgressChange={(offsetProgress, absoluteProgress) => {
            progress.value = absoluteProgress;
            setCurrentIndex(Math.round(absoluteProgress));
          }}
          renderItem={renderSlide}
          enabled={true}
          pagingEnabled
          snapEnabled
        />

        {/* Pagination */}
        <Pagination.Basic
          progress={progress}
          data={onboardingData}
          dotStyle={{
            backgroundColor: colors.mutedForeground,
            borderRadius: 5,
          }}
          activeDotStyle={{
            backgroundColor: colors.foreground,
            overflow: "hidden",
            borderRadius: 5,
          }}
          containerStyle={{
            gap: 5,
            marginTop: 20,
          }}
          onPress={onPressPagination}
        />
      </View>

      {/* Navigation Buttons */}
      <XStack gap="$3" justifyContent="space-between">
        <Button
          variant="secondary"
          size="lg"
          flex={1}
          onPress={onSkip}
          disabled={loading}
        >
          Skip
        </Button>
        
        <Button
          variant="primary" 
          size="lg"
          flex={1}
          onPress={handleNext}
        >
          {currentIndex === onboardingData.length - 1 ? "Start Setup" : "Next"}
        </Button>
      </XStack>
    </YStack>
  );
}