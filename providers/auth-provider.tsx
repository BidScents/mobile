import { LoginBottomSheet } from '@/components/auth/login-bottom-sheet';
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import React, { createContext, useContext, useRef, ReactNode } from 'react';

interface AuthContextType {
  showLoginSheet: () => void;
  hideLoginSheet: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Global singleton for auth actions (accessible outside React components)
let globalAuthActions: AuthContextType | null = null;

export function getGlobalAuthActions(): AuthContextType | null {
  return globalAuthActions;
}

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider component that provides global access to login functionality
 * 
 * Wraps the app with a LoginBottomSheet that can be triggered from anywhere
 * using the useAuthContext hook. This provides a consistent UX for auth prompts.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const loginSheetRef = useRef<BottomSheetModalMethods>(null);

  const showLoginSheet = () => {
    loginSheetRef.current?.present();
  };

  const hideLoginSheet = () => {
    loginSheetRef.current?.dismiss();
  };

  const contextValue: AuthContextType = {
    showLoginSheet,
    hideLoginSheet,
  };

  // Set global reference for use outside React components
  globalAuthActions = contextValue;

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
      <LoginBottomSheet ref={loginSheetRef} />
    </AuthContext.Provider>
  );
}

/**
 * Hook to access the auth context
 * @returns AuthContextType with showLoginSheet and hideLoginSheet functions
 */
export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}