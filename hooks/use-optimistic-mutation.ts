import { useCallback, useEffect, useRef } from 'react';

export interface UseOptimisticMutationOptions<TData, TVariables> {
  /**
   * The mutation function to call with the final changes
   */
  mutationFn: (variables: TVariables) => Promise<TData>;
  
  /**
   * Function to apply optimistic updates immediately
   */
  onOptimisticUpdate: (variables: TVariables) => void;
  
  /**
   * Function to revert changes on error (optional)
   */
  onRevert?: (originalValue: TVariables) => void;
  
  /**
   * Function to get the current value for diff detection (optional)
   */
  getCurrentValue?: () => TVariables;
  
  /**
   * Function to get the original/baseline value for diff detection (optional)
   */
  getOriginalValue?: () => TVariables;
  
  /**
   * Enable diff detection - only send changes if value differs from original
   */
  enableDiffDetection?: boolean;
  
  /**
   * Debounce delay in milliseconds
   */
  debounceMs?: number;
  
  /**
   * Success callback
   */
  onSuccess?: (data: TData, variables: TVariables) => void;
  
  /**
   * Error callback
   */
  onError?: (error: any, variables: TVariables) => void;
}

export interface OptimisticMutationReturn<TVariables> {
  /**
   * Trigger an optimistic update
   */
  mutate: (variables: TVariables) => void;
  
  /**
   * Whether a mutation is currently pending
   */
  isPending: boolean;
  
  /**
   * Clear any pending debounced mutations
   */
  cancel: () => void;
}

/**
 * Hook for optimistic mutations with debouncing and diff detection
 * 
 * Provides instant UI feedback + debounced API calls + error recovery.
 * Use for simple cache updates. Avoid for complex multi-cache mutations.
 */
export function useOptimisticMutation<TData = any, TVariables extends {} = any>({
  mutationFn,
  onOptimisticUpdate,
  onRevert,
  getCurrentValue,
  getOriginalValue,
  enableDiffDetection = false,
  debounceMs = 500,
  onSuccess,
  onError,
}: UseOptimisticMutationOptions<TData, TVariables>): OptimisticMutationReturn<TVariables> {
  
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPendingRef = useRef(false);
  const lastVariablesRef = useRef<TVariables | null>(null);
  const originalValueRef = useRef<TVariables | null>(null);

  // Store original value when diff detection is enabled
  useEffect(() => {
    if (enableDiffDetection && getOriginalValue && !originalValueRef.current) {
      originalValueRef.current = getOriginalValue();
    }
  }, [enableDiffDetection, getOriginalValue]);

  const executeDebounced = useCallback(async () => {
    if (!lastVariablesRef.current) return;

    let variablesToSend = lastVariablesRef.current;

    // Diff detection logic
    if (enableDiffDetection && getCurrentValue && getOriginalValue) {
      const currentValue = getCurrentValue();
      const originalValue = originalValueRef.current || getOriginalValue();
      
      // Check if there are actual changes
      const hasChanges = JSON.stringify(currentValue) !== JSON.stringify(originalValue);
      
      if (!hasChanges) {
        console.log('No changes detected, skipping API call');
        isPendingRef.current = false;
        return;
      }
      
      // Calculate the actual diff to send instead of just the last variables
      const diff: any = {};
      for (const key in currentValue) {
        if (currentValue[key] !== originalValue[key]) {
          diff[key] = currentValue[key];
        }
      }
      
      variablesToSend = diff as TVariables;
      console.log('Changes detected, sending diff:', variablesToSend);
    }

    try {
      isPendingRef.current = true;
      const result = await mutationFn(variablesToSend);
      
      // Update original value after successful mutation
      if (enableDiffDetection && getCurrentValue) {
        originalValueRef.current = getCurrentValue();
      }
      
      onSuccess?.(result, variablesToSend);
    } catch (error) {
      console.error('Optimistic mutation failed:', error);
      
      // Revert optimistic changes on error
      if (onRevert && originalValueRef.current) {
        onRevert(originalValueRef.current);
      }
      
      onError?.(error, variablesToSend);
    } finally {
      isPendingRef.current = false;
      lastVariablesRef.current = null;
    }
  }, [
    mutationFn, 
    enableDiffDetection, 
    getCurrentValue, 
    getOriginalValue, 
    onSuccess, 
    onError, 
    onRevert
  ]);

  const mutate = useCallback((variables: TVariables) => {
    // Apply optimistic update immediately
    onOptimisticUpdate(variables);
    
    // Store variables for debounced execution
    lastVariablesRef.current = variables;
    
    // Clear existing timeout and set new one
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(executeDebounced, debounceMs);
  }, [onOptimisticUpdate, executeDebounced, debounceMs]);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    lastVariablesRef.current = null;
    isPendingRef.current = false;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return {
    mutate,
    isPending: isPendingRef.current,
    cancel,
  };
}