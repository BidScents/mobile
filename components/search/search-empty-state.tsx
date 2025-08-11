import { Button } from '@/components/ui/button';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View, useTheme } from 'tamagui';

const SEARCH_SUGGESTIONS = ['Tom Ford', 'Creed', 'Aventus', 'Oud Wood'];

interface SearchEmptyStateProps {
  type: 'initial' | 'no-results' | 'error';
  title: string;
  message: string;
  onRetry?: () => void;
  onClearFilters?: () => void;
}

export function SearchEmptyState({
  type,
  title,
  message,
  onRetry,
  onClearFilters
}: SearchEmptyStateProps) {
  const theme = useTheme();

  const getIcon = () => {
    switch (type) {
      case 'initial':
        return 'search';
      case 'no-results':
        return 'document-outline';
      case 'error':
        return 'alert-circle-outline';
      default:
        return 'search';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'error':
        return theme.red10?.val || '#ef4444';
      default:
        return theme.mutedForeground?.val || '#6b7280';
    }
  };

  return (
    <View 
      flex={1} 
      justifyContent="center" 
      alignItems="center" 
      paddingHorizontal="$6"
      paddingVertical="$8"
    >
      <View 
        marginBottom="$4"
        alignItems="center"
        justifyContent="center"
        width={80}
        height={80}
        borderRadius={40}
        backgroundColor="$muted"
      >
        <Ionicons 
          name={getIcon()} 
          size={40} 
          color={getIconColor()} 
        />
      </View>

      <Text 
        fontSize="$6" 
        fontWeight="600" 
        color="$foreground" 
        textAlign="center"
        marginBottom="$2"
      >
        {title}
      </Text>

      <Text 
        fontSize="$4" 
        color="$mutedForeground" 
        textAlign="center"
        lineHeight="$5"
        marginBottom="$6"
      >
        {message}
      </Text>

      {/* Action buttons based on type */}
      {type === 'error' && onRetry && (
        <Button 
          onPress={onRetry}
          variant="secondary"
          size="lg"
        >
          Try Again
        </Button>
      )}

      {type === 'no-results' && onClearFilters && (
        <Button 
          onPress={onClearFilters}
          variant="secondary"
          size="lg"
        >
          Clear Filters
        </Button>
      )}

      {type === 'initial' && (
        <View alignItems="center" gap="$3">
          <Text fontSize="$3" color="$mutedForeground" textAlign="center">
            Try searching for:
          </Text>
          <View flexDirection="row" flexWrap="wrap" justifyContent="center" gap="$2">
            {SEARCH_SUGGESTIONS.map((suggestion) => (
              <View 
                key={suggestion}
                backgroundColor="$muted" 
                borderRadius="$4" 
                paddingHorizontal="$3" 
                paddingVertical="$2"
              >
                <Text fontSize="$3" color="$mutedForeground">
                  {suggestion}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}