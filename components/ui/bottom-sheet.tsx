import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet'
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types'
import { useTheme } from '@tamagui/core'
import React, { forwardRef, useCallback, useMemo } from 'react'

interface BottomSheetProps {
  children: React.ReactNode
  snapPoints?: string[]
  enablePanDownToClose?: boolean
  backgroundStyle?: object
  handleStyle?: object
  onDismiss?: () => void
}

/**
 * Reusable bottom sheet modal component using @gorhom/bottom-sheet.
 * Provides consistent styling and behavior across the app.
 */
export const BottomSheet = forwardRef<BottomSheetModalMethods, BottomSheetProps>(
  ({ 
    children, 
    snapPoints = ['25%', '50%', '75%'], 
    enablePanDownToClose = true,
    backgroundStyle,
    handleStyle,
    onDismiss 
  }, ref) => {
    const theme = useTheme()
    const snapPointsMemo = useMemo(() => snapPoints, [snapPoints])

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
          pressBehavior="close"
        />
      ),
      []
    )

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPointsMemo}
        enablePanDownToClose={enablePanDownToClose}
        backdropComponent={renderBackdrop}
        backgroundStyle={[
          {
            backgroundColor: theme.background.val,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          },
          backgroundStyle,
        ]}
        handleStyle={[
          {
            backgroundColor: theme.background.val,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          },
          handleStyle,
        ]}
        handleIndicatorStyle={{
          backgroundColor: theme.mutedForeground.val,
          width: 40,
          height: 4,
        }}
        onDismiss={onDismiss}
      >
        <BottomSheetView style={{ flex: 1, padding: 20 }}>
          {children}
        </BottomSheetView>
      </BottomSheetModal>
    )
  }
)

BottomSheet.displayName = 'BottomSheet'