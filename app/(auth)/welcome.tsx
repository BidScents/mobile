import { LoginBottomSheet } from '@/components/auth/login-bottom-sheet';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { useIntro } from '@/hooks/use-intro';
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Dimensions } from 'react-native';
import { runOnJS, useSharedValue } from 'react-native-reanimated';
import Carousel, { ICarouselInstance, Pagination } from 'react-native-reanimated-carousel';
import { Text, useTheme, View, YStack } from 'tamagui';


const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: 1,
    title: 'Shop fragrances Securely',
    description: 'Shop securely with our Built in Buyer protection System to protect both buyers and Sellers',
    image: require('../../assets/images/first.png'),
  },
  {
    id: 2,
    title: 'Sell quickly using Bidding',
    description: 'Want to get quick cash? Use the bidding system to offload your fragrance under 24 hours',
    image: require('../../assets/images/second.png'),
  },
  {
    id: 3,
    title: 'Boost listings for more visibility',
    description: 'Use our Standard or Premium Boost so that your listing gain more visibility and higher possibility of getting sold!',
    image: require('../../assets/images/third.png'),
  },
];

export default function WelcomeScreen() {
  const { markIntroSeen } = useIntro();
  const carouselRef = useRef<ICarouselInstance>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const progress = useSharedValue<number>(0);
  const theme = useTheme();
  const loginSheetRef = useRef<BottomSheetModalMethods>(null)

  const handleNext = async () => {
    if (currentIndex < SLIDES.length - 1) {
      carouselRef.current?.next();
    } else {
      await markIntroSeen();
      loginSheetRef.current?.present();
    }
  };

  const handleSkip = async () => {
    // await markIntroSeen();
    router.replace('/(tabs)/home');
  };

  const onPressPagination = (index: number) => {
    carouselRef.current?.scrollTo({
      count: index - progress.value,
      animated: true,
    });
  };

  // Optimize state updates to be faster than onSnapToItem
  const onProgressChange = (offsetProgress: number, absoluteProgress: number) => {
    progress.value = absoluteProgress;
    
    // Update index immediately when crossing the halfway point
    const newIndex = Math.round(absoluteProgress);
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < SLIDES.length) {
       runOnJS(setCurrentIndex)(newIndex);
    }
  };

  const renderItem = ({ item }: { item: typeof SLIDES[0] }) => (
    <View
      flex={1}
      justifyContent="center"
      alignItems="center"
      padding="$4"
      backgroundColor="$background"
    >
      <View 
        width={width * 0.9} 
        height={width * 0.9} 
        marginBottom="$6"
        justifyContent='center'
        alignItems='center'
      >
        <Image
          source={item.image}
          style={{ width: '100%', height: '100%' }}
          contentFit="contain"
        />
      </View>

      <YStack gap="$4" maxWidth={340}>
        <Text
          fontSize="$8"
          fontWeight="bold"
          textAlign="center"
          color="$foreground"
        >
          {item.title}
        </Text>
        <Text
          fontSize="$5"
          textAlign="center"
          color="$mutedForeground"
          lineHeight={24}
        >
          {item.description}
        </Text>
      </YStack>
    </View>
  );

  return (
    <Container variant="fullscreen" safeArea={['top']} backgroundColor="$background">
      <View flex={1} backgroundColor="$background">
        <View flex={1}>
          <Carousel
            ref={carouselRef}
            loop={false}
            width={width}
            height={height * 0.75}
            autoPlay={false}
            data={SLIDES}
            scrollAnimationDuration={500}
            onProgressChange={onProgressChange}
            renderItem={renderItem}
          />
        </View>

        <YStack gap="$5" justifyContent="flex-end" paddingBottom={50}>
           {/* Animated Pagination */}
           <Pagination.Basic
            progress={progress}
            data={SLIDES}
            dotStyle={{
              width: (width - 80) / SLIDES.length, // Distribute available width
              height: 4,
              backgroundColor: theme.gray5.val, // Inactive color
              borderRadius: 2,
            }}
            activeDotStyle={{
              overflow: 'hidden',
              backgroundColor: theme.foreground.val, // Active color
              borderRadius: 2,
            }}
            containerStyle={{
              gap: 10,
              justifyContent: 'center',
            }}
            horizontal
            onPress={onPressPagination}
          />

          {/* Controls */}
          <YStack px="$4" gap="$2">
            <Button
              size="lg"
              variant="primary"
              onPress={handleNext}
              key={currentIndex === SLIDES.length - 1 ? 'start' : 'next'} // Force re-render for clean switch
            >
              {currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
            </Button>
            
            <Button
              size="md"
              variant="ghost"
              onPress={handleSkip}
            >
              Skip
            </Button>
          </YStack>
        </YStack>
      </View>
      <LoginBottomSheet ref={loginSheetRef} />
    </Container>
  );
}
