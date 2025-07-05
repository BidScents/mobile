import { Stack } from "expo-router";

export default function AuthLayout() {

  return (
    <Stack
      screenOptions={{
        headerShown: false,     // hides header
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="email-login" options={{
        presentation: 'modal',
        animation: 'slide_from_bottom',
      }} />
      <Stack.Screen name="sign-up" options={{}} />
      <Stack.Screen name="login" options={{}} />
    </Stack>
  );
}