import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { signUpWithEmail } from "@/features/auth/services/authActions";

export default function SignUpScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSignUp = async () => {
    setError(null);
    setLoading(true);
    const { error: signUpError } = await signUpWithEmail(
      name.trim(),
      email.trim(),
      password,
    );
    setLoading(false);
    if (signUpError) {
      setError(signUpError.message ?? "Couldn't create your account.");
      return;
    }
    setSubmitted(true);
  };

  // Verification currently happens via a web page (per your backend config's
  // callbackURL of "/verify-email"), not a mobile deep link — so after
  // signing up, the user checks their email, verifies on the web, then
  // returns here to sign in normally.
  if (submitted) {
    return (
      <View className="flex-1 bg-background p-6 justify-center items-center">
        <Text
          className="text-text text-xl font-semibold text-center mb-2"
          accessibilityRole="header"
        >
          Check your email
        </Text>
        <Text className="text-muted text-center">
          We sent a verification link to {email}. Verify your email, then come
          back and sign in.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background p-6 justify-center">
      <Text
        className="text-text text-2xl font-semibold mb-6"
        accessibilityRole="header"
      >
        Create account
      </Text>

      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Full name"
        placeholderTextColor="#94A3B8"
        accessibilityLabel="Full name"
        className="bg-card text-text rounded-lg px-4 py-3 mb-3"
      />
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
        placeholder="Password (min 10 characters)"
        placeholderTextColor="#94A3B8"
        secureTextEntry
        accessibilityLabel="Password"
        className="bg-card text-text rounded-lg px-4 py-3 mb-3"
      />

      {error && <Text className="text-red-400 mb-3">{error}</Text>}

      <Pressable
        onPress={handleSignUp}
        disabled={loading || !name || !email || password.length < 10}
        accessibilityRole="button"
        accessibilityLabel="Create account"
        className="bg-primary rounded-full py-3 items-center mt-2"
      >
        {loading ? (
          <ActivityIndicator color="#F8FAFC" />
        ) : (
          <Text className="text-text font-medium">Create account</Text>
        )}
      </Pressable>
    </View>
  );
}
