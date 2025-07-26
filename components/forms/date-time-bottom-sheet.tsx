import { BottomSheet } from '@/components/ui/bottom-sheet'
import { Button } from '@/components/ui/button'
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types'
import RNDateTimePicker from '@react-native-community/datetimepicker'
import { useTheme } from '@tamagui/core'
import React, { forwardRef, useImperativeHandle, useState } from 'react'
import { Text, XStack, YStack } from 'tamagui'

interface DateTimeBottomSheetMethods extends BottomSheetModalMethods {
  dismiss: () => void
}

interface DateTimeBottomSheetProps {
  onSelect: (isoString: string) => void
  title?: string
  subtitle?: string
  initialValue?: string
}

export const DateTimeBottomSheet = forwardRef<DateTimeBottomSheetMethods, DateTimeBottomSheetProps>(
  ({ onSelect, title = "Select Date & Time", subtitle = "Choose auction end date and time", initialValue }, ref) => {
    const theme = useTheme()
    const bottomSheetRef = React.useRef<BottomSheetModalMethods>(null)
    
    const [selectedDate, setSelectedDate] = useState(() => {
      if (initialValue) {
        return new Date(initialValue)
      }
      // Default to 24 hours from now
      const tomorrow = new Date()
      tomorrow.setHours(tomorrow.getHours() + 24)
      return tomorrow
    })

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

    const handleConfirm = () => {
      // Validate date is in the future
      if (selectedDate <= new Date()) {
        return // Could add toast error here
      }
      
      onSelect(selectedDate.toISOString())
      bottomSheetRef.current?.dismiss()
    }

    return (
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={['70%', '90%']}
        backgroundStyle={{ backgroundColor: theme.background?.val || 'white' }}
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

          {/* Date & Time Pickers */}
          <XStack gap="$4" flex={1} justifyContent="flex-start">
            <XStack alignItems="center">
              <Text fontSize="$5" fontWeight="500" color="$foreground">Date:</Text>
              <RNDateTimePicker 
                mode="date" 
                display="default" 
                value={selectedDate} 
                minimumDate={new Date()}
                onChange={(event, date) => date && setSelectedDate(date)} 
              />
            </XStack>
            
            <XStack alignItems="center">
              <Text fontSize="$5" fontWeight="500" color="$foreground">Time:</Text>
              <RNDateTimePicker 
                mode="time" 
                display="default" 
                value={selectedDate} 
                onChange={(event, date) => date && setSelectedDate(date)} 
              />
            </XStack>
          </XStack>

          {/* Confirm Button */}
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onPress={handleConfirm}
            borderRadius="$10"
            disabled={selectedDate <= new Date()}
            mt="$4"
          >
            Confirm
          </Button>
        </YStack>
      </BottomSheet>
    )
  }
)

DateTimeBottomSheet.displayName = 'DateTimeBottomSheet'