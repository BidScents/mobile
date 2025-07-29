import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { useTheme } from "@tamagui/core";
import React, { useCallback, useRef, useState } from "react";
import type { KeyboardTypeOptions } from "react-native";
import { Keyboard } from "react-native";
import {
  Paragraph,
  Switch,
  Input as TamaguiInput,
  Text,
  TextArea,
  XStack,
  YStack
} from "tamagui";
import { DateTimeBottomSheet } from "../forms/date-time-bottom-sheet";
import { SelectBottomSheet } from "../forms/select-bottom-sheet";

/**
 * Input variant types
 */
export type InputVariant =
  | "text"
  | "email"
  | "password"
  | "username"
  | "first_name"
  | "last_name"
  | "bio"
  | "multiline"
  | "numeric"
  | "select"
  | "date"
  | "switch";

/**
 * Select option interface
 */
export interface SelectOption {
  label: string;
  value: string;
}

/**
 * Props for the Input component
 */
export interface InputProps {
  /** Input variant that determines behavior and styling */
  variant?: InputVariant;
  /** Input label displayed above the field */
  label: string;
  /** Placeholder text */
  placeholder: string;
  /** Input value (controlled by forms component) */
  value: string;
  /** Change handler (controlled by forms component) */
  onChangeText: (text: string) => void;
  /** Whether the field has been touched (for validation display) */
  touched?: boolean;
  /** Error message displayed when validation fails (passed from forms) */
  error?: string;
  /** Number of lines for multiline variants */
  numberOfLines?: number;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Options for select variants */
  options?: SelectOption[];
  /** Custom title for select bottom sheet */
  selectTitle?: string;
  /** Custom subtitle for select bottom sheet */
  selectSubtitle?: string;
  /** Whether the switch is checked */
  switchChecked?: boolean;
  /** Change handler for switch */
  onSwitchChange?: (checked: boolean) => void;
}

/**
 * Simple, clean Input component
 */
export const Input: React.FC<InputProps> = ({
  variant = "text",
  label,
  placeholder,
  value,
  onChangeText,
  touched = false,
  error,
  numberOfLines,
  disabled = false,
  options = [],
  selectTitle,
  selectSubtitle,
  switchChecked,
  onSwitchChange,
}) => {
  const theme = useTheme();
  const [showPassword, setShowPassword] = useState(false);

  const selectBottomSheetRef = useRef<BottomSheetModalMethods>(null);
  const dateTimeBottomSheetRef = useRef<BottomSheetModalMethods>(null);

  const handleSelect = useCallback(() => {
    if (!disabled) {
      Keyboard.dismiss();
      selectBottomSheetRef.current?.present();
    }
  }, [disabled]);

  const handleOptionSelect = useCallback(
    (selectedValue: string) => {
      onChangeText(selectedValue);
    },
    [onChangeText]
  );

  const handleDateTimeSelect = useCallback(
    (isoString: string) => {
      onChangeText(isoString);
    },
    [onChangeText]
  );

  // Get display text for selected value
  const getDisplayText = useCallback(() => {
    if (!value) return placeholder;

    const selectedOption = options.find((opt) => opt.value === value);
    return selectedOption ? selectedOption.label : value;
  }, [value, placeholder, options]);

  const getDateTimeDisplayText = useCallback(() => {
    if (!value) return placeholder;
  
    try {
      const date = new Date(value);
      
      // Use device's locale automatically
      return date.toLocaleString(undefined, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: undefined // Let device decide 12/24 hour format
      });
    } catch {
      return value;
    }
  }, [value, placeholder]);

  // Get variant-specific configuration
  const getVariantConfig = (variant: InputVariant) => {
    switch (variant) {
      case "email":
        return {
          keyboardType: "email-address" as KeyboardTypeOptions,
          textContentType: "emailAddress" as const,
          autoComplete: "email" as const,
          autoCapitalize: "none" as const,
          autoCorrect: false,
        };
      case "password":
        return {
          secureTextEntry: !showPassword,
          textContentType: "password" as const,
          autoComplete: "password" as const,
          autoCapitalize: "none" as const,
          autoCorrect: false,
        };
      case "username":
        return {
          textContentType: "username" as const,
          autoComplete: "username" as const,
          autoCapitalize: "none" as const,
          autoCorrect: false,
        };
      case "first_name":
        return {
          textContentType: "givenName" as const,
          autoComplete: "given-name" as const,
          autoCapitalize: "words" as const,
          autoCorrect: true,
        };
      case "last_name":
        return {
          textContentType: "familyName" as const,
          autoComplete: "family-name" as const,
          autoCapitalize: "words" as const,
          autoCorrect: true,
        };
      case "bio":
        return {
          textContentType: "none" as const,
          autoComplete: "off" as const,
          autoCapitalize: "sentences" as const,
          autoCorrect: true,
          isMultiline: true,
        };
      case "multiline":
        return {
          textContentType: "none" as const,
          autoComplete: "off" as const,
          autoCapitalize: "sentences" as const,
          isMultiline: true,
        };
      case "numeric":
        return {
          textContentType: "none" as const,
          autoComplete: "off" as const,
          autoCapitalize: "none" as const,
          keyboardType: "numeric" as const,
        };
      case "text":
        return {
          textContentType: "none" as const,
          autoComplete: "off" as const,
          autoCapitalize: "words" as const,
          keyboardType: "default" as const,
        };
      default:
        return {
          textContentType: "none" as const,
          autoComplete: "off" as const,
          autoCapitalize: "none" as const,
        };
    }
  };

  const config = getVariantConfig(variant);
  const isMultiline =
    config.isMultiline || variant === "bio" || variant === "multiline";
  const finalNumberOfLines = numberOfLines || (variant === "bio" ? 4 : 3);
  const isPassword = variant === "password";
  const isSelect = variant === "select";
  const isDate = variant === "date";
  const isSwitch = variant === "switch";

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Input props for Tamagui component
  const inputProps = {
    placeholder,
    value,
    onChangeText,
    keyboardType: config.keyboardType || "default",
    textContentType: config.textContentType,
    autoComplete: config.autoComplete,
    autoCapitalize: config.autoCapitalize,
    autoCorrect: config.autoCorrect,
    secureTextEntry: config.secureTextEntry,
    size: "$5" as const,
    height: isMultiline ? undefined : 50,
    borderRadius: "$6",
    width: "100%",
    color: "$foreground",
    borderWidth: 0,
    placeholderTextColor: "$mutedForeground",
    backgroundColor: "$muted",
    px: "$4",
    py: isMultiline ? "$3" : undefined,
    fontWeight: "400",
    disabled,
    textTransform: "none" as const,
  };

  return (
    <YStack borderRadius="$6" width="100%" gap="$2">
      <Paragraph fontWeight="400" color="$mutedForeground">
        {label}
      </Paragraph>

      {isSwitch ? (
        <XStack 
        alignItems="center"
        justifyContent="space-between"
        borderRadius="$6"
        backgroundColor="$muted"
        px="$4"
        py="$3"
        minHeight={50}>
        <Text
          fontSize="$5"
          fontWeight="400"
          color="$mutedForeground"
          flex={1}
        >
          {label}
        </Text>
          <Switch size="$4" disabled={disabled} native defaultChecked={switchChecked} onCheckedChange={onSwitchChange}>
            <Switch.Thumb animation="bouncy" />
          </Switch>
        </XStack>
      ) : isPassword ? (
        <XStack
          alignItems="center"
          borderRadius="$6"
          backgroundColor="$muted"
          pr="$3"
        >
          <TamaguiInput
            flex={1}
            {...inputProps}
            backgroundColor="transparent"
            borderRadius="$6"
          />
          <Ionicons
            name={showPassword ? "eye-off" : "eye"}
            size={20}
            color={theme.mutedForeground?.val || "#666"}
            onPress={togglePasswordVisibility}
            style={{ cursor: "pointer" }}
          />
        </XStack>
      ) : isSelect || isDate ? (
        <XStack
          alignItems="center"
          justifyContent="space-between"
          borderRadius="$6"
          backgroundColor="$muted"
          px="$4"
          py="$3"
          minHeight={50}
          onPress={
            isDate
              ? () => {
                  if (!disabled) {
                    Keyboard.dismiss();
                    dateTimeBottomSheetRef.current?.present();
                  }
                }
              : handleSelect
          }
          style={{ cursor: disabled ? "not-allowed" : "pointer" }}
          opacity={disabled ? 0.6 : 1}
        >
          <Text
            fontSize="$5"
            fontWeight="400"
            color={value ? "$foreground" : "$mutedForeground"}
            flex={1}
          >
            {isDate ? getDateTimeDisplayText() : getDisplayText()}
          </Text>
          <Ionicons
            name="chevron-down"
            size={20}
            color={theme.mutedForeground?.val || "#666"}
            style={{
              cursor: disabled ? "not-allowed" : "pointer",
              opacity: disabled ? 0.6 : 1,
            }}
          />
        </XStack>
      ) : isMultiline ? (
        <TextArea numberOfLines={finalNumberOfLines} {...inputProps} />
      ) : (
        <TamaguiInput {...inputProps} />
      )}

      {error && (
        <Text
          textTransform="none"
          fontSize="$2"
          color="$error"
          fontWeight="400"
        >
          {error}
        </Text>
      )}

      {/* Select Bottom Sheet */}
      {isSelect && (
        <SelectBottomSheet
          ref={selectBottomSheetRef}
          options={options}
          onSelect={handleOptionSelect}
          title={selectTitle || `Select ${label}`}
          subtitle={
            selectSubtitle ||
            `Choose from the available ${label.toLowerCase()} options`
          }
        />
      )}
      {isDate && (
        <DateTimeBottomSheet
          ref={dateTimeBottomSheetRef}
          onSelect={handleDateTimeSelect}
          initialValue={value}
          title={selectTitle || `Select ${label}`}
          subtitle={selectSubtitle || `Choose the ${label.toLowerCase()}`}
        />
      )}
    </YStack>
  );
};

export default Input;
