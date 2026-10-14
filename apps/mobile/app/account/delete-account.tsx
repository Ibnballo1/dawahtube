import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { deleteAccount } from "@/features/auth/services/authActions";

const CONFIRM_PHRASE = "DELETE";

export default function DeleteAccountScreen() {
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setError(null);
    setLoading(true);
    const { error: deleteError } = await deleteAccount();
    setLoading(false);
    if (deleteError) {
      setError("Couldn't delete your account. Please try again.");
      return;
    }
    router.replace("/(tabs)");
  };

  return (
    <View className="flex-1 bg-background p-6">
      <Text
        className="text-text text-xl font-semibold mb-2"
        accessibilityRole="header"
      >
        Delete account
      </Text>
      <Text className="text-muted mb-6">
        This permanently deletes your account. This cannot be undone.
      </Text>
      <Text className="text-muted text-sm mb-2">
        Type {CONFIRM_PHRASE} to confirm:
      </Text>
      <TextInput
        value={confirmText}
        onChangeText={setConfirmText}
        placeholder={CONFIRM_PHRASE}
        placeholderTextColor="#94A3B8"
        autoCapitalize="characters"
        accessibilityLabel={`Type ${CONFIRM_PHRASE} to confirm account deletion`}
        className="bg-card text-text rounded-lg px-4 py-3 mb-4"
      />
      {error && <Text className="text-red-400 mb-3">{error}</Text>}
      <Pressable
        onPress={handleDelete}
        disabled={loading || confirmText !== CONFIRM_PHRASE}
        accessibilityRole="button"
        accessibilityLabel="Permanently delete account"
        className={`rounded-full py-3 items-center ${confirmText === CONFIRM_PHRASE ? "bg-red-600" : "bg-card"}`}
      >
        {loading ? (
          <ActivityIndicator color="#F8FAFC" />
        ) : (
          <Text className="text-text font-medium">Delete my account</Text>
        )}
      </Pressable>
    </View>
  );
}
