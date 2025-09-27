import { BottomSheet } from "@/components/ui/bottom-sheet";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import * as Haptics from "expo-haptics";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { Keyboard, Pressable, StyleSheet } from "react-native";
import { Text, View, XStack, YStack } from "tamagui";
import { useThemeColors } from "../../hooks/use-theme-colors";
import { Button } from "../ui/button";
import { ThemedIonicons } from "../ui/themed-icons";

export interface EditBottomSheetMethods {
  present: () => void;
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
    const colors = useThemeColors();
    const [isEditing, setIsEditing] = useState(false);
    
    const textInputStyles = [
      styles.textInput,
      {
        backgroundColor: colors.muted,
        color: colors.foreground,
        borderColor: colors.border,
      },
    ];
    const [editText, setEditText] = useState(initialText);
    const bottomSheetRef = React.useRef<BottomSheetModalMethods>(null);

    useImperativeHandle(ref, () => ({
      present: () => {
        setIsEditing(false);
        setEditText(initialText);
        bottomSheetRef.current?.present();
      },
      dismiss: () => bottomSheetRef.current?.dismiss(),
    }));

    // Update editText when initialText changes (for different comments)
    useEffect(() => {
      setEditText(initialText);
    }, [initialText]);

    const handleEditPress = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setIsEditing(true);
    };

    const handleDeletePress = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      bottomSheetRef.current?.dismiss();
      onDelete();
    };

    const handleSendEdit = () => {
      if (editText.trim()) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Keyboard.dismiss();
        setTimeout(() => {
          bottomSheetRef.current?.dismiss();
          onEdit(editText.trim());
        }, 120);
      }
    };

    const handleBackToOptions = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setEditText(initialText);
      setIsEditing(false);
    };

    return (
      <BottomSheet
        ref={bottomSheetRef}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        enableDynamicSizing={true}
        onDismiss={() => {
          setEditText(initialText);
          setIsEditing(false);
        }}
      >
          <YStack gap="$4" padding="$4" paddingBottom="$8" >
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
                    <ThemedIonicons
                      name="close"
                      size={24}
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
                  <BottomSheetTextInput
                    style={textInputStyles}
                    placeholder={placeholder}
                    placeholderTextColor={colors.placeholder}
                    value={editText}
                    onChangeText={setEditText}
                    multiline={true}
                    numberOfLines={4}
                    textAlignVertical="top"
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
                      <ThemedIonicons
                        name="send"
                        size={16}
                        themeColor="foreground"
                        style={{ color: colors.background }}
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
                      <ThemedIonicons
                        name="pencil"
                        size={20}
                        themeColor="foreground"
                        style={{ color: colors.background }}
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
                    <ThemedIonicons
                      name="chevron-forward"
                      size={20}
                      themeColor="muted"
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
                        <ThemedIonicons
                          name="trash"
                          size={20}
                          themeColor="foreground"
                          style={{ color: colors.background }}
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
                      <ThemedIonicons
                        name="chevron-forward"
                        size={20}
                        themeColor="muted"
                      />
                    </XStack>
                  </Pressable>
                )}
              </YStack>
            )}
          </YStack>
      </BottomSheet>
    );
  }
);

EditBottomSheet.displayName = "EditBottomSheet";

const styles = StyleSheet.create({
  textInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 14,
    minHeight: 10,
    maxHeight: 200,
  },
});
