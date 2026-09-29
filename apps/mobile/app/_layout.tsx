import "../global.css";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query/queryClient";
import { useDownloadsStore } from "@/features/downloads/store/downloadsStore";
import { OfflineBanner } from "@/components/ui/OfflineBanner";
import { MiniPlayer } from "@/features/player/components/MiniPlayer";
import { useHistoryStore } from "@/features/history/store/historyStore";
import { useBookmarksStore } from "@/features/bookmarks/store/bookmarksStore";

export default function RootLayout() {
  useEffect(() => {
    useDownloadsStore.getState().hydrate();
    useBookmarksStore.getState().hydrate();
    useHistoryStore.getState().hydrate();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <OfflineBanner />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="player/index"
            options={{ presentation: "modal" }}
          />
          <Stack.Screen
            name="(auth)/sign-in"
            options={{ presentation: "modal" }}
          />
          <Stack.Screen
            name="(auth)/sign-up"
            options={{ presentation: "modal" }}
          />
        </Stack>
        <MiniPlayer />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
