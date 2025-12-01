import { BottomSheet } from "@/components/ui/bottom-sheet";
import { ThemedIonicons } from "@/components/ui/themed-icons";
import { useNotifications } from "@/hooks/use-notifications";
import { useAuthStore } from "@bid-scents/shared-sdk";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import React, { forwardRef, useImperativeHandle } from "react";
import { Text, View, XStack, YStack } from "tamagui";
import { Button } from "../ui/button";

export interface NotificationsBottomSheetMethods {
  present: () => void;
  dismiss: () => void;
}

export const NotificationsBottomSheet = forwardRef<NotificationsBottomSheetMethods>((props, ref) => {
  const bottomSheetRef = React.useRef<BottomSheetModalMethods>(null);
  const {requestPermissionsAndRegister} = useNotifications()
  const { setDeviceToken } = useAuthStore()

  useImperativeHandle(ref, () => ({
      present: () => bottomSheetRef.current?.present(),
      dismiss: () => bottomSheetRef.current?.dismiss(),
  }))

  const handlePress = async () =>{
    await requestPermissionsAndRegister()
    bottomSheetRef.current?.dismiss()
  }


  return (
    <BottomSheet
      ref={bottomSheetRef}
      enableDynamicSizing={true}
      onDismiss={() => {}}
      enablePanDownToClose={false}
      pressBehavior={"none"}
    >
      <YStack gap="$5" padding="$4" paddingBottom="$8">
        <XStack alignItems="center" justifyContent="space-between">
          <Text 
            textAlign="left" 
            fontSize="$7" 
            fontWeight="$4"
            color="$foreground"
          >
            Notifications
          </Text>
          <View onPress={() => {bottomSheetRef.current?.dismiss()}} backgroundColor="$muted" padding="$1.5" borderRadius="$10">
            <ThemedIonicons name="close" size={20} themeColor="foreground" />
          </View>
        </XStack>
        <YStack marginBottom="$4">
          {/* Topmost notification */}
          <XStack alignItems="center" justifyContent="center" gap="$3" borderColor="$muted" borderWidth="$0.5" borderRadius="$6" padding="$2" p="$4" backgroundColor="$background" zIndex={3}>
            <View padding="$2.5" borderRadius="$4" backgroundColor="$muted">
              <ThemedIonicons name="notifications" size={24} themeColor="foreground" />
            </View>
            <YStack gap="$1">
              <Text
                fontSize="$5" 
                fontWeight="$4"
                color="$foreground"
              >
                Stay updated with listings and bids
              </Text>
              <Text
                fontSize="$3" 
                fontWeight="$2"
                color="$mutedForeground"
              >
                Turn on notifications and get regular updates
              </Text>
            </YStack>
          </XStack>
          {/* Middle notification */}
          <XStack position="absolute" bottom={-10} left={10} right={10} alignItems="center" justifyContent="center" gap="$3" borderColor="$muted" backgroundColor="$background" borderWidth="$0.5" borderRadius="$6" padding="$2" p="$4" background="$background" opacity={0.8} zIndex={2}>
            <View padding="$2.5" borderRadius="$4" backgroundColor="$muted">
              <ThemedIonicons name="notifications" size={24} themeColor="foreground" />
            </View>
            <YStack>
              <Text
                fontSize="$5" 
                fontWeight="$4"
                color="$foreground"
              >
                Stay updated with listings and bids!
              </Text>
              <Text
                fontSize="$3" 
                fontWeight="$2"
                color="$mutedForeground"
              >
                Turn on notifications and get regular updates!
              </Text>
            </YStack>
          </XStack>
          {/* Bottom notification */}
          <XStack position="absolute" bottom={-20} left={20} right={20} alignItems="center" justifyContent="center" gap="$3" borderColor="$muted" backgroundColor="$background" borderWidth="$0.5" borderRadius="$6" padding="$2" p="$4" background="$background" opacity={0.6} zIndex={1}>
            <View padding="$2.5" borderRadius="$4" backgroundColor="$muted">
              <ThemedIonicons name="notifications" size={24} themeColor="foreground" />
            </View>
            <YStack>
              <Text
                fontSize="$5" 
                fontWeight="$4"
                color="$foreground"
              >
                Stay updated with listings and bids!
              </Text>
              <Text
                fontSize="$3" 
                fontWeight="$2"
                color="$mutedForeground"
              >
                Turn on notifications and get regular updates!
              </Text>
            </YStack>
          </XStack>
        </YStack>
        <Button
        variant="secondary"
        size="lg"
        fullWidth
        borderRadius="$6"
        onPress={handlePress}
        >
          Allow Notifications
        </Button>
      </YStack>
    </BottomSheet>
  );
});

NotificationsBottomSheet.displayName = "NotificationsBottomSheet";