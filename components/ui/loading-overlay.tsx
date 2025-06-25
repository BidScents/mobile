import { useLoadingStore } from '@bid-scents/shared-sdk'
import React from 'react'
import { Modal } from 'react-native'
import { Spinner, View, useTheme } from 'tamagui'

export const LoadingOverlay: React.FC = () => {
  const { isLoading } = useLoadingStore()
  const theme = useTheme()

  return (
    <Modal visible={isLoading} transparent animationType="fade">
      <View
        flex={1}
        backgroundColor="rgba(0, 0, 0, 0.5)"
        alignItems="center"
        justifyContent="center"
      >
        <View
          backgroundColor="rgba(255, 255, 255, 1)"
          borderRadius="$5"
          padding="$5"
          justifyContent='center'
          alignItems='center'
        >
          <Spinner 
            size="large" 
            color={theme.foreground.get()} 
          />
        </View>
      </View>
    </Modal>
  )
}

export default LoadingOverlay