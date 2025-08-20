/**
 * Authentication initialization utilities
 *
 * Helper functions for managing app startup authentication logic.
 * Handles session management, user data fetching, and auth state listeners.
 */

import { supabase } from "@/lib/supabase";
import {
  AuthService,
  handleAuthStateChange,
  useAuthStore,
} from "@bid-scents/shared-sdk";

/**
 * Handle existing session logic
 *
 * When a valid session exists, this function:
 * - Syncs session with SDK
 * - Checks if user data needs refreshing
 * - Makes API call only if necessary
 */
export const handleExistingSession = async (
  session: any,
  existingUser: any,
  setAuthState: (session: any, loginResponse: any) => void,
  setLoading: (loading: boolean) => void,
) => {
  // Configure API token before making API calls
  handleAuthStateChange("SIGNED_IN", session);
  
  const needsUserData = !existingUser || !existingUser.onboarded_at;

  if (needsUserData) {
    try {
      console.log("Fetching user data from API...");
      const loginResult = await AuthService.loginV1AuthLoginGet();
      // Set complete auth state atomically
      setAuthState(session, loginResult);
    } catch (apiError: any) {
      console.log("API error occurred:", apiError);

      if (
        apiError.status === 500 ||
        apiError.status === 502 ||
        apiError.status === 503
      ) {
        console.log("Server error - maintaining existing auth state");
        if (existingUser) {
          // Use existing user data but with current session
          const fallbackResponse = {
            onboarded: !!existingUser.onboarded_at,
            profile: existingUser,
            favorites: []
          };
          setAuthState(session, fallbackResponse);
        } else {
          console.log("No cached user data available, user will need to retry");
          setLoading(false);
        }
      } else if (apiError.status === 401 || apiError.status === 403) {
        console.log("Authentication error - clearing session");
        setAuthState(null, null);
        handleAuthStateChange("SIGNED_OUT", null);
      } else {
        console.log("User likely needs onboarding");
        setAuthState(session, { onboarded: false, profile: null, favorites: [] });
      }
    }
  } else {
    console.log("Using cached user data");
    const cachedResponse = {
      onboarded: !!existingUser.onboarded_at,
      profile: existingUser,
      favorites: []
    };
    setAuthState(session, cachedResponse);
  }
};

/**
 * Handle no session logic
 *
 * When no session exists, clear all auth state using the store's logout method
 */
export const handleNoSession = async () => {
  handleAuthStateChange("SIGNED_OUT", null);
};

/**
 * Handle sign in event
 *
 * Called when user signs in - syncs session and fetches user data if needed
 */
export const handleSignIn = async (
  session: any,
  setAuthState: (session: any, loginResponse: any) => void,
  setLoading: (loading: boolean) => void
) => {
  // Configure API token before making API calls
  handleAuthStateChange("SIGNED_IN", session);
  
  const { user: currentUser } = useAuthStore.getState();
  const needsUserData = !currentUser || !currentUser.onboarded_at;

  if (needsUserData) {
    try {
      const loginResult = await AuthService.loginV1AuthLoginGet();
      // Set complete auth state atomically
      setAuthState(session, loginResult);
    } catch (apiError: any) {
      console.log("API call failed during auth change:", apiError);

      if (
        apiError.status === 500 ||
        apiError.status === 502 ||
        apiError.status === 503
      ) {
        console.log(
          "Server error during sign in - maintaining existing auth state"
        );
        if (currentUser) {
          const fallbackResponse = {
            onboarded: !!currentUser.onboarded_at,
            profile: currentUser,
            favorites: []
          };
          setAuthState(session, fallbackResponse);
        } else {
          setLoading(false);
        }
      } else if (apiError.status === 401 || apiError.status === 403) {
        console.log("Authentication error during sign in - clearing session");
        setAuthState(null, null);
        handleAuthStateChange("SIGNED_OUT", null);
      } else {
        console.log("User likely needs onboarding");
        setAuthState(session, { onboarded: false, profile: null, favorites: [] });
      }
    }
  } else {
    // Use existing user data
    const cachedResponse = {
      onboarded: !!currentUser.onboarded_at,
      profile: currentUser,
      favorites: []
    };
    setAuthState(session, cachedResponse);
  }
};

/**
 * Handle sign out event
 *
 * Called when user signs out - clears Supabase session and all local state
 */
export const handleSignOut = async () => {
  try {
    // Sign out from Supabase first (clears server session)
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Supabase signout error:", error);
    }
    // Stack.Protected will handle navigation based on auth state change
  } catch (error) {
    console.error("Error during sign out:", error);
    // Stack.Protected will handle navigation when auth state becomes false
  }
};

/**
 * Set up Supabase auth state change listener
 *
 * Listens for auth events (sign in/out) and updates app state accordingly
 */
export const setupAuthStateListener = (
  setAuthState: (session: any, loginResponse: any) => void,
  setLoading: (loading: boolean) => void,
) => {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(async (event, session) => {
    console.log("Auth state changed:", event, !!session);

    if (event === "SIGNED_IN" && session) {
      await handleSignIn(session, setAuthState, setLoading);
    } else if (event === "SIGNED_OUT") {
      // When Supabase triggers SIGNED_OUT, clear local state and navigate
      console.log("Supabase triggered SIGNED_OUT");
      handleAuthStateChange("SIGNED_OUT", null);
    } else if (event === "TOKEN_REFRESHED") {
      console.log("Token refreshed");
      handleAuthStateChange("TOKEN_REFRESHED", session);
    }
  });

  // Return cleanup function
  return () => subscription.unsubscribe();
};
