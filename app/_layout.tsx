import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context"; // safe area wrapper

import { UserContextProvider } from "@/context/authContext";
import { useColorScheme } from "@/hooks/use-color-scheme";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <UserContextProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <SafeAreaView
          style={{ flex: 1, backgroundColor: "transparent" }}
          edges={["top"]}
        >
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="modal"
              options={{ presentation: "modal", title: "Modal" }}
            />
            <Stack.Screen name="sign_in" options={{ headerShown: false }} />
          </Stack>
          {/* <StatusBar style="auto" /> */}
        </SafeAreaView>
      </ThemeProvider>
    </UserContextProvider>
  );
}
