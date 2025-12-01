import { BottomSheet } from '@/components/ui/bottom-sheet'
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types'
import * as Haptics from 'expo-haptics'
import React, { forwardRef, useImperativeHandle } from 'react'
import { Text, XStack, YStack } from 'tamagui'
import { useThemeColors } from '../../hooks/use-theme-colors'
import { Button } from '../ui/button'

interface QuickActionBottomSheetMethods extends BottomSheetModalMethods {
  dismiss: () => void
}

interface QuickActionBottomSheetProps {
  primaryOption?: string
  secondaryOption?: string
  onSelectPrimary: () => void
  onSelectSecondary: () => void
  title?: string
  subtitle?: string
}

export const QuickActionBottomSheet = forwardRef<QuickActionBottomSheetMethods, QuickActionBottomSheetProps>(
  ({ primaryOption = "", secondaryOption = "", onSelectPrimary, onSelectSecondary, title = "Select Option", subtitle = "Choose from the available options below" }, ref) => {
    const colors = useThemeColors()
    const bottomSheetRef = React.useRef<BottomSheetModalMethods>(null)

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

    const handleOptionSelect = (option: string, onSelect: () => void) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      onSelect()
      bottomSheetRef.current?.dismiss()
    }

    return (
      <BottomSheet
        ref={bottomSheetRef}
        backgroundStyle={{ backgroundColor: colors.background || 'white' }}
      >
        <YStack gap="$4" padding="$4" paddingBottom="$8" flex={1}>
          {/* Header */}
          <YStack gap="$2">
            <Text 
              textAlign="left" 
              fontSize="$7" 
              fontWeight="600"
              color="$foreground"
            >
              {title}
            </Text>
            <Text 
              textAlign="left" 
              color="$mutedForeground" 
              fontSize="$4"
              lineHeight="$5"
            >
              {subtitle}
            </Text>
          </YStack>

          <XStack gap="$2">
            <Button
              onPress={() => {
                handleOptionSelect(secondaryOption, onSelectSecondary)
              }}
              variant="secondary"
              size="lg"
              disabled={!secondaryOption}
              flex={1}
              borderRadius="$6"
            >
              {secondaryOption}
            </Button>
            <Button
              onPress={() => {
                handleOptionSelect(primaryOption, onSelectPrimary)
              }}
              variant="primary"
              size="lg"
              disabled={!primaryOption}
              flex={1}
              borderRadius="$6"
            >
              {primaryOption}
            </Button>
          </XStack>
        </YStack>
      </BottomSheet>
    )
  }
)

QuickActionBottomSheet.displayName = 'QuickActionBottomSheet'