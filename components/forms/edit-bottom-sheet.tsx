import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { useTheme } from "@tamagui/core";
import * as Haptics from "expo-haptics";
import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useState,
} from "react";
import { Pressable } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Text, View, XStack, YStack } from "tamagui";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export interface EditBottomSheetMethods extends BottomSheetModalMethods {
  dismiss: () => void;
}

export interface EditBottomSheetProps {
  /** Current text to edit */
  initialText?: string;
  /** Title for the bottom sheet */
  title?: string;
  /** Subtitle for the bottom sheet */
  subtitle?: string;
  /** Placeholder for the input field */
  placeholder?: string;
  /** Callback when edit is confirmed */
  onEdit: (newText: string) => void;
  /** Callback when delete is confirmed */
  onDelete: () => void;
  /** Whether to show delete option */
  showDelete?: boolean;
  /** Custom edit button text */
  editButtonText?: string;
  /** Custom delete button text */
  deleteButtonText?: string;
}

export const EditBottomSheet = forwardRef<
  EditBottomSheetMethods,
  EditBottomSheetProps
>(
  (
    {
      initialText = "",
      title = "Edit Options",
      subtitle = "Choose an action below",
      placeholder = "Enter your text...",
      onEdit,
      onDelete,
      showDelete = true,
      editButtonText = "Edit",
      deleteButtonText = "Delete",
    },
    ref
  ) => {
    const theme = useTheme();
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(initialText);
    const bottomSheetRef = React.useRef<BottomSheetModalMethods>(null);

    useImperativeHandle(ref, () => ({
      present: () => {
        setIsEditing(false);
        setEditText(initialText);
        bottomSheetRef.current?.present();
      },
      dismiss: () => bottomSheetRef.current?.dismiss(),
      close: () => bottomSheetRef.current?.close(),
      collapse: () => bottomSheetRef.current?.collapse(),
      expand: () => bottomSheetRef.current?.expand(),
      snapToIndex: (index: number) =>
        bottomSheetRef.current?.snapToIndex(index),
      snapToPosition: (position: string | number) =>
        bottomSheetRef.current?.snapToPosition(position),
      forceClose: () => bottomSheetRef.current?.forceClose(),
    }));

    // Update editText when initialText changes (for different comments)
    useEffect(() => {
      setEditText(initialText);
    }, [initialText]);

    const handleEditPress = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setIsEditing(true);
    };

    // // Effect to handle snapping and focusing when entering edit mode
    // useEffect(() => {
    //   if (isEditing) {
    //     // Snap to 80% when entering edit mode
    //     setTimeout(() => {
    //       bottomSheetRef.current?.snapToIndex(0); // 0 index = 80% (first snap point)
    //     }, 100);
    //   }
    // }, [isEditing]);

    const handleDeletePress = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      bottomSheetRef.current?.dismiss();
      onDelete();
    };

    const handleSendEdit = () => {
      if (editText.trim()) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        bottomSheetRef.current?.dismiss();
        onEdit(editText.trim());
      }
    };

    const handleBackToOptions = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setIsEditing(false);
      setEditText(initialText);
    };

    return (
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={isEditing ? ["75%"] : ["40%", "60%"]}
        backgroundStyle={{ backgroundColor: theme.background?.val || "white" }}
        onDismiss={() => {
          setIsEditing(false);
          setEditText(initialText);
        }}
      >
        <KeyboardAwareScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          extraKeyboardSpace={20}
        >
          <YStack gap="$4" padding="$4" paddingBottom="$8" flex={1}>
            {/* Header */}
            <YStack gap="$2">
              <XStack alignItems="center" justifyContent="space-between">
                <Text
                  textAlign="left"
                  fontSize="$7"
                  fontWeight="600"
                  color="$foreground"
                >
                  {isEditing ? "Edit Text" : title}
                </Text>
                {isEditing && (
                  <Pressable onPress={handleBackToOptions}>
                    <Ionicons
                      name="close"
                      size={24}
                      color={theme.foreground?.val}
                    />
                  </Pressable>
                )}
              </XStack>
              <Text
                textAlign="left"
                color="$mutedForeground"
                fontSize="$4"
                lineHeight="$5"
              >
                {isEditing ? "Make your changes and send" : subtitle}
              </Text>
            </YStack>

            {isEditing ? (
              /* Edit Mode */
              <YStack gap="$4" flex={1}>
                <View flex={1}>
                  <Input
                    variant="multiline"
                    placeholder={placeholder}
                    value={editText}
                    onChangeText={setEditText}
                    numberOfLines={4}
                    key={isEditing ? "editing" : "not-editing"} // Force re-render to trigger focus
                  />
                </View>

                <XStack gap="$3">
                  <Button
                    onPress={handleBackToOptions}
                    variant="secondary"
                    size="md"
                    flex={1}
                    borderRadius="$10"
                  >
                    Cancel
                  </Button>
                  <Button
                    onPress={handleSendEdit}
                    variant="primary"
                    size="md"
                    flex={1}
                    disabled={
                      !editText.trim() || editText.trim() === initialText.trim()
                    }
                    borderRadius="$10"
                  >
                    <XStack alignItems="center" gap="$2">
                      <Text color="$background" fontWeight="600">
                        Send
                      </Text>
                      <Ionicons
                        name="send"
                        size={16}
                        color={theme.background?.val}
                      />
                    </XStack>
                  </Button>
                </XStack>
              </YStack>
            ) : (
              /* Options Mode */
              <YStack gap="$3" flex={1}>
                {/* Edit Option */}
                <Pressable
                  onPress={handleEditPress}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <XStack
                    alignItems="center"
                    gap="$3"
                    borderRadius="$6"
                    backgroundColor="$muted"
                    paddingVertical="$4"
                    paddingHorizontal="$4"
                  >
                    <View
                      backgroundColor="$foreground"
                      borderRadius="$12"
                      padding="$2"
                    >
                      <Ionicons
                        name="pencil"
                        size={20}
                        color={theme.background?.val}
                      />
                    </View>
                    <YStack flex={1}>
                      <Text fontSize="$5" fontWeight="600" color="$foreground">
                        {editButtonText}
                      </Text>
                      <Text fontSize="$3" color="$mutedForeground">
                        Make changes to your comment
                      </Text>
                    </YStack>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={theme.mutedForeground?.val}
                    />
                  </XStack>
                </Pressable>

                {/* Delete Option */}
                {showDelete && (
                  <Pressable
                    onPress={handleDeletePress}
                    style={({ pressed }) => ({
                      opacity: pressed ? 0.7 : 1,
                    })}
                  >
                    <XStack
                      alignItems="center"
                      gap="$3"
                      borderRadius="$6"
                      backgroundColor="$muted"
                      paddingVertical="$4"
                      paddingHorizontal="$4"
                    >
                      <View
                        backgroundColor="$error"
                        borderRadius="$12"
                        padding="$2"
                      >
                        <Ionicons
                          name="trash"
                          size={20}
                          color={theme.background?.val}
                        />
                      </View>
                      <YStack flex={1}>
                        <Text
                          fontSize="$5"
                          fontWeight="600"
                          color="$foreground"
                        >
                          {deleteButtonText}
                        </Text>
                        <Text fontSize="$3" color="$mutedForeground">
                          Remove this comment permanently
                        </Text>
                      </YStack>
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={theme.mutedForeground?.val}
                      />
                    </XStack>
                  </Pressable>
                )}
              </YStack>
            )}
          </YStack>
        </KeyboardAwareScrollView>
      </BottomSheet>
    );
  }
);

EditBottomSheet.displayName = "EditBottomSheet";
