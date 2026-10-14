import { useNotificationSettingsStore } from "../store/notificationSettingsStore";
import * as notificationService from "../services/notificationService";

export function useNotificationSettings() {
  const settings = useNotificationSettingsStore();

  const setEnabled = async (enabled: boolean) => {
    if (enabled) {
      const granted = await notificationService.ensurePermission();
      if (!granted) return false; // caller should surface this to the user
      await notificationService.configureAndroidChannel();
      await notificationService.scheduleDailyReminder(
        settings.hour,
        settings.minute,
      );
    } else {
      await notificationService.cancelDailyReminder();
    }
    settings.update({ enabled });
    return true;
  };

  const setTime = async (hour: number, minute: number) => {
    settings.update({ hour, minute });
    if (settings.enabled) {
      await notificationService.scheduleDailyReminder(hour, minute);
    }
  };

  return { ...settings, setEnabled, setTime };
}
