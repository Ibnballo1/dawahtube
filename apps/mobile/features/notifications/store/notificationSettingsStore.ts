import { create } from "zustand";
import { createMMKV } from "react-native-mmkv";

const storage = createMMKV({ id: "dawahtube-notifications" });
const KEY = "settings";

export interface NotificationSettings {
  enabled: boolean;
  hour: number; // 0-23, local device time
  minute: number; // 0-59
}

const DEFAULTS: NotificationSettings = { enabled: false, hour: 6, minute: 0 };

function load(): NotificationSettings {
  const raw = storage.getString(KEY);
  if (!raw) return DEFAULTS;
  try {
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULTS;
  }
}
function save(value: NotificationSettings) {
  storage.set(KEY, JSON.stringify(value));
}

interface NotificationSettingsState extends NotificationSettings {
  hydrate: () => void;
  update: (patch: Partial<NotificationSettings>) => void;
}

export const useNotificationSettingsStore = create<NotificationSettingsState>(
  (set, get) => ({
    ...DEFAULTS,
    hydrate: () => set(load()),
    update: (patch) => {
      const next = { ...get(), ...patch };
      save({ enabled: next.enabled, hour: next.hour, minute: next.minute });
      set(patch);
    },
  }),
);
