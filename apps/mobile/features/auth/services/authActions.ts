import {
  flushOutbox,
  wipeLocalUserData,
} from "@/features/sync/services/syncEngine";
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
  await flushOutbox().catch(() => {}); // best effort while the session is still valid
  const result = await authClient.signOut();
  wipeLocalUserData();
  return result;
}

export async function updateProfile(name: string) {
  return authClient.updateUser({ name });
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
) {
  return authClient.changePassword({
    currentPassword,
    newPassword,
    revokeOtherSessions: true, // sign out other devices for security after a password change
  });
}

export async function deleteAccount() {
  return authClient.deleteUser();
}
