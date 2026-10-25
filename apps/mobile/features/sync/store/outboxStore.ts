import { create } from "zustand";
import { createMMKV } from "react-native-mmkv";
import { opKey, type OutboxOp } from "../types/sync.types";

const syncStorage = createMMKV({ id: "dawahtube-sync" });
const OUTBOX_KEY = "outbox";
const USER_KEY = "syncedUserId";

function load(): OutboxOp[] {
  const raw = syncStorage.getString(OUTBOX_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as OutboxOp[];
  } catch {
    return [];
  }
}
function save(ops: OutboxOp[]) {
  syncStorage.set(OUTBOX_KEY, JSON.stringify(ops));
}

/** The account this device's local data is bound to. null = guest data. */
export function getSyncedUserId(): string | null {
  return syncStorage.getString(USER_KEY) ?? null;
}
export function setSyncedUserId(id: string | null) {
  if (id) syncStorage.set(USER_KEY, id);
  else syncStorage.remove(USER_KEY);
}

interface OutboxState {
  ops: OutboxOp[];
  clear: () => void;
}

export const useOutboxStore = create<OutboxState>((set) => ({
  ops: load(),
  clear: () => {
    save([]);
    set({ ops: [] });
  },
}));

export function enqueue(op: OutboxOp) {
  if (!getSyncedUserId()) return; // guests aren't bound to an account yet; the first-sign-in merge uploads everything
  const current = useOutboxStore.getState().ops;
  const key = opKey(op);
  const kept =
    op.kind === "history.clear"
      ? current.filter((o) => !opKey(o).startsWith("history:"))
      : current.filter((o) => opKey(o) !== key);
  const ops = [...kept, op];
  save(ops);
  useOutboxStore.setState({ ops });
}

/** Removes by reference, so a newer op queued while this one was in flight survives. */
export function removeOp(op: OutboxOp) {
  const ops = useOutboxStore.getState().ops.filter((o) => o !== op);
  save(ops);
  useOutboxStore.setState({ ops });
}
