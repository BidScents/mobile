import { useLoadingStore } from '@bid-scents/shared-sdk'
import React from 'react'
import { Modal } from 'react-native'
import { Spinner, View } from 'tamagui'

export const LoadingOverlay: React.FC = () => {
  const { isLoading } = useLoadingStore()

  return (
    <Modal visible={isLoading} transparent animationType="fade">
      <View
        flex={1}
        backgroundColor="$background"
        alignItems="center"
        justifyContent="center"
      >
        <View
          backgroundColor="$background" 
          borderRadius="$5"
          padding="$5"
          justifyContent='center'
          alignItems='center'
        >
          <Spinner 
            size="large" 
            color="$foreground" 
          />
        </View>
      </View>
    </Modal>
  )
}

export default LoadingOverlay