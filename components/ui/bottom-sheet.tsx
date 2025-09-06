import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet'
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types'
import React, { forwardRef, useCallback, useMemo } from 'react'
import { useThemeColors } from '../../hooks/use-theme-colors'

interface BottomSheetProps {
  children: React.ReactNode
  snapPoints?: string[]
  enablePanDownToClose?: boolean
  backgroundStyle?: object
  handleStyle?: object
  onDismiss?: () => void
  keyboardBehavior?: 'extend' | 'fillParent' | 'interactive'
  keyboardBlurBehavior?: 'none' | 'restore'
  enableDynamicSizing?: boolean
  pressBehavior?: 'close' | 'none'
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
    onDismiss,
    keyboardBehavior = 'interactive',
    keyboardBlurBehavior = 'restore',
    enableDynamicSizing = true,
    pressBehavior = 'close'
  }, ref) => {
    const colors = useThemeColors()
    const snapPointsMemo = useMemo(() => snapPoints, [snapPoints])

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
          pressBehavior={pressBehavior}
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
            backgroundColor: colors.background,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          },
          backgroundStyle,
        ]}
        handleStyle={[
          {
            backgroundColor: colors.background,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          },
          handleStyle,
        ]}
        handleIndicatorStyle={{
          backgroundColor: colors.mutedForeground,
          width: 40,
          height: 4,
        }}
        keyboardBehavior={keyboardBehavior}
        keyboardBlurBehavior={keyboardBlurBehavior}
        enableDynamicSizing={enableDynamicSizing}
        onDismiss={onDismiss}
      >
        <BottomSheetView style={{ flex: 1,  }}>
          {children}
        </BottomSheetView>
      </BottomSheetModal>
    )
  }
)

BottomSheet.displayName = 'BottomSheet'