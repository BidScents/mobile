import { useAnnouncements } from '@/hooks/use-announcements';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React from 'react';
import { Modal } from 'react-native';
import { ScrollView, Text, View, YStack } from 'tamagui';
import { Button } from '../ui/button';

export const AnnouncementModal = () => {
  const { announcement, visible, dismissAnnouncement, hasMore } = useAnnouncements();

  if (!announcement) return null;

  const handleAction = async () => {
    if (announcement.action_url) {
      try {
        router.push(announcement.action_url as any);
      } catch (err) {
        console.error('Failed to open URL:', err);
      }
    }
    dismissAnnouncement();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={dismissAnnouncement}
    >
      <View
        flex={1}
        justifyContent="center"
        alignItems="center"
        padding="$4"
        backgroundColor="rgba(0,0,0,0.5)"
      >
        <View
          backgroundColor="$background"
          borderRadius="$6"
          width="100%"
          maxWidth={400}
          overflow="hidden"
          shadowColor="$shadowColor"
          shadowRadius={10}
          shadowOpacity={0.2}
        >

          <ScrollView bounces={false}>
            {/* Image */}
            {announcement.image_url && (
              <Image
                source={{ uri: announcement.image_url }}
                style={{ width: '100%', height: 200 }}
                contentFit="cover"
              />
            )}

            <YStack padding="$4" gap="$3">
              
              {/* Title */}
              <Text fontSize="$7" fontWeight={600} color="$foreground">
                {announcement.title}
              </Text>

              {/* Message */}
              <Text fontSize="$5" color="$mutedForeground" lineHeight={22}>
                {announcement.message}
              </Text>


              <View>

              {/* Action Button */}
              {announcement.action_text && (
                <Button
                variant="primary"
                onPress={handleAction}
                size="lg"
                marginTop="$2"
                >
                  {announcement.action_text}
                </Button>
              )}
              
              <Button
                variant={announcement.action_text ? "ghost" : "primary"}
                onPress={dismissAnnouncement}
                size="lg"
                marginTop="$2"
                >
                {hasMore ? "Next" : "Continue"}
              </Button>
              </View>
            </YStack>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
