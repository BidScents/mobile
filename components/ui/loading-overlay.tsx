import { useLoadingStore } from '@bid-scents/shared-sdk'
import React from 'react'
import { Modal } from 'react-native'
import { Spinner, View } from 'tamagui'
import { useThemeColors } from '../../hooks/use-theme-colors'

export const LoadingOverlay: React.FC = () => {
  const { isLoading } = useLoadingStore()
  const colors = useThemeColors()

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
            color={colors.foreground} 
          />
        </View>
      </View>
    </Modal>
  )
}

export default LoadingOverlay