import { Stack } from "expo-router";

import { RoutineStoreProvider } from "@/store/routine-store";

export default function RootLayout() {
  return (
    <RoutineStoreProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="routine-edit" options={{ presentation: "modal" }} />
        <Stack.Screen name="task-edit" options={{ presentation: "modal" }} />
      </Stack>
    </RoutineStoreProvider>
  );
}
