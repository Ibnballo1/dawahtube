import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { signInWithEmail } from "@/features/auth/services/authActions";

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setError(null);
    setLoading(true);
    const { error: signInError } = await signInWithEmail(
      email.trim(),
      password,
    );
    setLoading(false);
    if (signInError) {
      setError(
        signInError.status === 403
          ? "Please verify your email before signing in — check your inbox."
          : "Incorrect email or password.",
      );
      return;
    }
    router.back();
  };

  return (
    <View className="flex-1 bg-background p-6 justify-center">
      <Text
        className="text-text text-2xl font-semibold mb-6"
        accessibilityRole="header"
      >
        Sign in
      </Text>

      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        placeholderTextColor="#94A3B8"
        autoCapitalize="none"
        keyboardType="email-address"
        accessibilityLabel="Email"
        className="bg-card text-text rounded-lg px-4 py-3 mb-3"
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        placeholderTextColor="#94A3B8"
        secureTextEntry
        accessibilityLabel="Password"
        className="bg-card text-text rounded-lg px-4 py-3 mb-3"
      />

      {error && <Text className="text-red-400 mb-3">{error}</Text>}

      <Pressable
        onPress={handleSignIn}
        disabled={loading || !email || !password}
        accessibilityRole="button"
        accessibilityLabel="Sign in"
        className="bg-primary rounded-full py-3 items-center mt-2"
      >
        {loading ? (
          <ActivityIndicator color="#F8FAFC" />
        ) : (
          <Text className="text-text font-medium">Sign in</Text>
        )}
      </Pressable>

      <Pressable
        onPress={() => router.push("/(auth)/sign-up")}
        accessibilityRole="button"
        accessibilityLabel="Create an account"
        className="items-center mt-4"
      >
        <Text className="text-gold">Don&apos;t have an account? Sign up</Text>
      </Pressable>
    </View>
  );
}
