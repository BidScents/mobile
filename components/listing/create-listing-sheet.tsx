import { BottomSheet } from '@/components/ui/bottom-sheet'
import { Button } from '@/components/ui/button'
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types'
import { useTheme } from '@tamagui/core'
import React, { forwardRef, useImperativeHandle } from 'react'
import { Text, YStack } from 'tamagui'

interface CreateListingSheetMethods extends BottomSheetModalMethods {
  dismiss: () => void
}


export const CreateListingSheet = forwardRef<CreateListingSheetMethods>((props, ref) => {
  const bottomSheetRef = React.useRef<BottomSheetModalMethods>(null)
  const theme = useTheme()

  useImperativeHandle(ref, () => ({
    present: () => bottomSheetRef.current?.present(),
    dismiss: () => bottomSheetRef.current?.dismiss(),
    close: () => bottomSheetRef.current?.close(),
    collapse: () => bottomSheetRef.current?.collapse(),
    expand: () => bottomSheetRef.current?.expand(),
    snapToIndex: (index: number) => bottomSheetRef.current?.snapToIndex(index),
    snapToPosition: (position: string | number) => bottomSheetRef.current?.snapToPosition(position),
    forceClose: () => bottomSheetRef.current?.forceClose(),
  }))

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={['90%', '50%']}
      backgroundStyle={{ backgroundColor: theme.background?.get() }}
    >
      <YStack gap="$5" padding="$4" paddingBottom="$8">
        {/* Header */}
        <YStack gap="$2">
          <Text 
            textAlign="left" 
            fontSize="$7" 
            fontWeight="$3"
            color="$foreground"
          >
            Get Started
          </Text>
          <Text 
            textAlign="left" 
            color="$mutedForeground" 
            fontSize="$4"
            lineHeight="$5"
          >
            Register to buy, sell or swap your favorite scents and much more with your account.
          </Text>
        </YStack>

        {/* Main Action Buttons */}
        <YStack gap="$3" alignItems="center">
          <Button
            variant="primary"
            size="lg"
            fullWidth
          >
            Continue with Email
          </Button>

        </YStack>

      </YStack>
    </BottomSheet>
  )
})

CreateListingSheet.displayName = 'CreateListingSheet'