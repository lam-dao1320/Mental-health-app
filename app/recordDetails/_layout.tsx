// app/recordDetails/_layout.tsx
import { Stack } from "expo-router";

export default function RecordDetailsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="[id]"
        options={{ headerShown: false, headerBackButtonDisplayMode: "minimal" }} // hides the bar for this route
      />
    </Stack>
  );
}
