import { ThemedIonicons } from "@/components/ui/themed-icons";
import { TouchableOpacity } from "react-native";

interface InputActionsProps {
  showTransactionButton: boolean;
  onTransactionPress: () => void;
  onImagePickerPress: () => void;
}

export const InputActions = ({ 
  showTransactionButton, 
  onTransactionPress, 
  onImagePickerPress 
}: InputActionsProps) => {
  return (
    <>
      {showTransactionButton && (
        <TouchableOpacity onPress={onTransactionPress}>
          <ThemedIonicons name="add-circle-outline" size={24} color="$mutedForeground" />
        </TouchableOpacity>
      )}
      <TouchableOpacity onPress={onImagePickerPress}>
        <ThemedIonicons name="camera-outline" size={24} color="$mutedForeground" />
      </TouchableOpacity>
    </>
  );
};