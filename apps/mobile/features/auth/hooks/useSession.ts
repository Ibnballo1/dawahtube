import { authClient } from "../services/authClient";

export function useSession() {
  return authClient.useSession(); // { data: Session | null, isPending, error }
}
