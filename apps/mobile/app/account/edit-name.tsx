import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { updateProfile } from "@/features/auth/services/authActions";
import { useSession } from "@/features/auth/hooks/useSession";

export default function EditNameScreen() {
  const { data: session } = useSession();
  const [name, setName] = useState(
    (
      session as unknown as
        { user?: { name?: string | null } } | null | undefined
    )?.user?.name ?? "",
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setError(null);
    setLoading(true);
    const { error: updateError } = await updateProfile(name.trim());
    setLoading(false);
    if (updateError) {
      setError("Couldn't update your name. Please try again.");
      return;
    }
    router.back();
  };

  return (
    <View className="flex-1 bg-background p-6">
      <Text
        className="text-text text-xl font-semibold mb-6"
        accessibilityRole="header"
      >
        Edit name
      </Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Full name"
        placeholderTextColor="#94A3B8"
        accessibilityLabel="Full name"
        className="bg-card text-text rounded-lg px-4 py-3 mb-3"
      />
      {error && <Text className="text-red-400 mb-3">{error}</Text>}
      <Pressable
        onPress={handleSave}
        disabled={loading || !name.trim()}
        accessibilityRole="button"
        accessibilityLabel="Save name"
        className="bg-primary rounded-full py-3 items-center mt-2"
      >
        {loading ? (
          <ActivityIndicator color="#F8FAFC" />
        ) : (
          <Text className="text-text font-medium">Save</Text>
        )}
      </Pressable>
    </View>
  );
}
