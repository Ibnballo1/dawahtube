// better-auth is resolved from the monorepo dependency graph at runtime.
// eslint-disable-next-line import/no-unresolved
import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";
import type { BetterAuthClientPlugin } from "better-auth/client";

// BetterAuth mounts at /api/auth on the app's origin — not under /api/v1.
const API_ORIGIN = process.env.EXPO_PUBLIC_API_URL!.replace(
  /\/api\/v1\/?$/,
  "",
);

// export const authClient = createAuthClient({
//   baseURL: API_ORIGIN,
//   plugins: [
//     expoClient({
//       scheme: "dawahtube",
//       storagePrefix: "dawahtube",
//       storage: SecureStore,
//     }),
//   ],
// });

export const authClient = createAuthClient({
  baseURL: API_ORIGIN,
  plugins: [
    expoClient({
      scheme: "dawahtube",
      storagePrefix: "dawahtube",
      storage: SecureStore,
    }) as BetterAuthClientPlugin,
  ],
});
