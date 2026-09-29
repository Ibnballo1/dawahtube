import { authClient } from "./authClient";

export async function signInWithEmail(email: string, password: string) {
  return authClient.signIn.email({ email, password });
}

export async function signUpWithEmail(
  name: string,
  email: string,
  password: string,
) {
  return authClient.signUp.email({ name, email, password });
}

export async function signOut() {
  return authClient.signOut();
}
