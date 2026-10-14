import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { changePassword } from "@/features/auth/services/authActions";

export default function ChangePasswordScreen() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    setError(null);
    setLoading(true);
    const { error: changeError } = await changePassword(
      currentPassword,
      newPassword,
    );
    setLoading(false);
    if (changeError) {
      setError(
        changeError.status === 401
          ? "Current password is incorrect."
          : "Couldn't change your password. Please try again.",
      );
      return;
    }
    setSuccess(true);
  };

  if (success) {
    return (
      <View className="flex-1 bg-background p-6 justify-center items-center">
        <Text
          className="text-text text-xl font-semibold text-center mb-2"
          accessibilityRole="header"
        >
          Password changed
        </Text>
        <Text className="text-muted text-center mb-6">
          Your password was updated, and you&apos;ve been signed out on your
          other devices for security.
        </Text>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Done"
          className="bg-primary rounded-full px-6 py-3"
        >
          <Text className="text-text font-medium">Done</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background p-6">
      <Text
        className="text-text text-xl font-semibold mb-6"
        accessibilityRole="header"
      >
        Change password
      </Text>
      <TextInput
        value={currentPassword}
        onChangeText={setCurrentPassword}
        placeholder="Current password"
        placeholderTextColor="#94A3B8"
        secureTextEntry
        accessibilityLabel="Current password"
        className="bg-card text-text rounded-lg px-4 py-3 mb-3"
      />
      <TextInput
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder="New password (min 10 characters)"
        placeholderTextColor="#94A3B8"
        secureTextEntry
        accessibilityLabel="New password"
        className="bg-card text-text rounded-lg px-4 py-3 mb-3"
      />
      {error && <Text className="text-red-400 mb-3">{error}</Text>}
      <Pressable
        onPress={handleSave}
        disabled={loading || !currentPassword || newPassword.length < 10}
        accessibilityRole="button"
        accessibilityLabel="Change password"
        className="bg-primary rounded-full py-3 items-center mt-2"
      >
        {loading ? (
          <ActivityIndicator color="#F8FAFC" />
        ) : (
          <Text className="text-text font-medium">Change password</Text>
        )}
      </Pressable>
    </View>
  );
}
