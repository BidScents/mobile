import React from 'react';
import { Linking, Modal } from 'react-native';
import { Button, H3, Paragraph, View, YStack } from 'tamagui';

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
        alignItems="center"
        justifyContent="center"
        padding="$4"
      >
        <YStack space="$4" maxWidth={400} alignItems="center">
          <H3 textAlign="center">Update Required</H3>
          <Paragraph textAlign="center" color="$color">
            A new version of the app is available. Please update to continue using the app.
          </Paragraph>
          
          <Button
            size="$5"
            onPress={handleUpdatePress}
            width="100%"
            mt="$4"
          >
            Update App
          </Button>
        </YStack>
      </View>
    </Modal>
  );
};
