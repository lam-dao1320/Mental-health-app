import { Stack } from "expo-router";

export default function SettingStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // Optional: ensure iOS swipe works and stays within this stack
        gestureEnabled: true,
      }}
    />
  );
}
