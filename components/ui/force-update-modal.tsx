import React from 'react';
import { Linking, Modal } from 'react-native';
import { Text, View, YStack } from 'tamagui';
import { Button } from './button';
import { ThemedIonicons } from './themed-icons';

interface ForceUpdateModalProps {
  visible: boolean;
  storeUrl: string;
}

export const ForceUpdateModal: React.FC<ForceUpdateModalProps> = ({ visible, storeUrl }) => {
  const handleUpdatePress = () => {
    if (storeUrl) {
      Linking.openURL(storeUrl).catch((err) => 
        console.error('An error occurred trying to open the store URL:', err)
      );
    }
  };

  return (
    <Modal visible={visible} transparent={false} animationType="fade">
      <View
        flex={1}
        backgroundColor="$background"
        justifyContent="center"
        padding="$4"
        gap="$6"
      >
        <YStack gap="$3" alignItems="center">
          <ThemedIonicons name="warning" size={56} color="$foreground" />
          <Text fontSize="$7" fontWeight="bold" textAlign="center" color="$foreground">Update Required</Text>
          <Text fontSize="$5" fontWeight="normal" textAlign="center" color="$foreground">
            A new version of the app is available. Please update to continue using the app.
          </Text>
          
        </YStack>
        <Button
          variant="primary"
          onPress={handleUpdatePress}
          fullWidth
          size='lg'
          position='absolute'
          bottom={40}
          left={20}
          right={20}
        >
          Update App
        </Button>
      </View>
    </Modal>
  );
};
