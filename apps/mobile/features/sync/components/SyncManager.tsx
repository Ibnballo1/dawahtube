import { useEffect } from "react";
import { AppState } from "react-native";
import { useSession } from "@/features/auth/hooks/useSession";
import { useNetworkStatus } from "@/lib/network/useNetworkStatus";
import { useOutboxStore } from "../store/outboxStore";
import { syncNow, flushOutbox } from "../services/syncEngine";

export function SyncManager() {
  const { data: session } = useSession();
  const userId = (session as { user?: { id?: string } } | null | undefined)
    ?.user?.id;
  const { isConnected } = useNetworkStatus();

  // Full sync on sign-in and whenever connectivity returns.
  useEffect(() => {
    if (userId && isConnected) void syncNow(userId);
  }, [userId, isConnected]);

  // Foreground: full sync. Background: push whatever is pending, right now.
  useEffect(() => {
    if (!userId) return;
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") void syncNow(userId);
      if (state === "background") void flushOutbox();
    });
    return () => sub.remove();
  }, [userId]);

  // Push local changes shortly after they're made.
  useEffect(() => {
    if (!userId) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const unsubscribe = useOutboxStore.subscribe(() => {
      clearTimeout(timer);
      timer = setTimeout(() => void flushOutbox(), 2000);
    });
    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, [userId]);

  return null;
}
