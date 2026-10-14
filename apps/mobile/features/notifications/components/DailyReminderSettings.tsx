import { useState } from "react";
import { View, Text, Switch, Pressable, Alert } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNotificationSettings } from "../hooks/useNotificationSettings";

export function DailyReminderSettings() {
  const { enabled, hour, minute, setEnabled, setTime } =
    useNotificationSettings();
  const [showPicker, setShowPicker] = useState(false);

  const timeLabel = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;

  const handleToggle = async (value: boolean) => {
    const ok = await setEnabled(value);
    if (!ok) {
      Alert.alert(
        "Notifications disabled",
        "Enable notifications for Da'wahTube in your device settings to receive a daily reminder.",
      );
    }
  };

  return (
    <View className="bg-card rounded-xl p-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-text font-medium">Daily reminder</Text>
        <Switch
          value={enabled}
          onValueChange={handleToggle}
          accessibilityLabel="Enable daily reminder notification"
        />
      </View>

      {enabled && (
        <Pressable
          onPress={() => setShowPicker(true)}
          accessibilityRole="button"
          accessibilityLabel={`Reminder time, currently ${timeLabel}`}
          className="mt-3"
        >
          <Text className="text-gold">Time: {timeLabel}</Text>
        </Pressable>
      )}

      {showPicker && (
        <DateTimePicker
          value={new Date(2000, 0, 1, hour, minute)}
          mode="time"
          onChange={(_, selected) => {
            setShowPicker(false);
            if (selected) setTime(selected.getHours(), selected.getMinutes());
          }}
        />
      )}
    </View>
  );
}
