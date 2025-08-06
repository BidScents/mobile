import React, { useEffect, useRef, useState } from "react";
import { Text, TextProps, View } from "tamagui";

/**
 * Props for the ShowMoreText component
 */
interface ShowMoreTextProps extends Omit<TextProps, 'children' | 'numberOfLines'> {
  /** The text content to display */
  children: string;
  /** Maximum number of lines to show when collapsed (default: 3) */
  lines?: number;
  /** Text for the expand button (default: "Show more") */
  more?: string;
  /** Text for the collapse button (default: "Show less") */
  less?: string;
  /** Controlled expanded state. If provided, component becomes controlled */
  expanded?: boolean;
  /** Callback fired when expand/collapse state changes */
  onToggle?: (expanded: boolean) => void;
  /** Color for the show more/less button (default: "$blue10") */
  buttonColor?: string;
}

/**
 * A React Native compatible component that displays text with expand/collapse functionality.
 *
 * Features:
 * - Automatically detects if text needs truncation based on character count
 * - Supports both controlled and uncontrolled modes
 * - Only shows expand/collapse button when text actually needs truncation
 * - Fully customizable styling through Tamagui props
 *
 * @example
 * // Uncontrolled usage
 * <ShowMoreText lines={3}>
 *   Your long text content here...
 * </ShowMoreText>
 *
 * @example
 * // Controlled usage
 * <ShowMoreText
 *   lines={3}
 *   expanded={isExpanded}
 *   onToggle={setIsExpanded}
 * >
 *   Your long text content here...
 * </ShowMoreText>
 */
export const ShowMoreText: React.FC<ShowMoreTextProps> = ({
  children,
  lines = 3,
  more = "Show more",
  less = "Show less",
  expanded: controlledExpanded,
  buttonColor = "$blue10",
  onToggle,
  ...textProps
}) => {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const [needsTruncation, setNeedsTruncation] = useState(false);
  const textRef = useRef<any>(null);

  const isControlled = controlledExpanded !== undefined;
  const expanded = isControlled ? controlledExpanded : internalExpanded;

  useEffect(() => {
    // Determine if text needs truncation using character count heuristic
    // This is more reliable than text measurement in React Native
    if (children) {
      const charactersPerLine = 40; // Approximate characters per line (adjustable)
      const estimatedLines = children.length / charactersPerLine;
      const shouldTruncate = estimatedLines > lines;

      setNeedsTruncation(shouldTruncate);
    }
  }, [children, lines]);

  /**
   * Handles the expand/collapse toggle action
   * Supports both controlled and uncontrolled component patterns
   */
  const handleToggle = () => {
    if (isControlled) {
      // In controlled mode, notify parent of state change
      onToggle?.(!expanded);
    } else {
      // In uncontrolled mode, manage internal state
      setInternalExpanded(!expanded);
      onToggle?.(!expanded);
    }
  };

  return (
    <View>
      <Text
        ref={textRef}
        numberOfLines={expanded ? undefined : lines}
        {...textProps}
      >
        {children}
      </Text>
      {needsTruncation && (
        <Text
          fontSize={textProps.fontSize || "$4"}
          color={buttonColor}
          fontWeight={textProps.fontWeight || "400"}
          marginTop="$1"
          onPress={handleToggle}
          cursor="pointer"
        >
          {expanded ? less : more}
        </Text>
      )}
    </View>
  );
};
